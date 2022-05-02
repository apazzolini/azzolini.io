---
title: Preventing Session Hijacking With Spring
date: 2012-10-11
published: true
---

Session hijacking, also known as session fixation, is a neat exploit. It relies on the fact that HTTP is a stateless protocol and users must identify themselves to servers on every request with a shared session id, which is typically stored as a cookie. The core of the attack relies on obtaining that session id and then setting your own session id to that value. This lets you "steal" another user's session and impersonate them. Obviously, this is unacceptable, especially for an open-source ecommerce framework like Broadleaf, and we need to ensure that we are protecting our users' data as much as we can. We'll cover our strategy to protect against session hijacking shortly, but first, let's analyze a couple of different attacks that we can utilize to steal a session.

## Three ways to obtain another user's session id

### sniff the cookie

The most technically simple method we can use is to sniff someone's cookie. [Firesheep](http://en.wikipedia.org/wiki/Firesheep) made this particular attack vector very popular when it was [famously](http://lifehacker.com/5672313/sniff-out-user-credentials-at-wi+fi-hotspots-with-firesheep) [used](http://blogs.computerworld.com/17254/i_hijacked_a_facebook_account_with_firesheep) to steal Facebook accounts. Basically, you listen to unencrypted network traffic for other users, and watch for the session id to be transmitted. Once it is, you have immediate access to it and can impersonate the user. Boom.

### Steal the cookie

A harder attack to pull off requires a couple of extra vulnerabilities to be identified on the website. First, the cookie must not be set as HTTP-only, which then allows JavaScript to read the cookie value. Secondly, you must identify a cross-site scripting attack to perform. With those two elements in place, you can craft malicious JavaScript that will result in a user sending you the value of the cookie directly, without their knowledge.

### Fabricate the cookie

By far the most technically challenging attack is fabricating a cookie that will validate on the application server and has the values you want (this is only applicable to applications that have non-random data in their session cookies). This will require knowledge of how the application server is generating the session ids (which is typically reduced to knowing which framework a website uses) and if the cookie contains any other data you'd like to modify. A group of people from [Credera](http://www.credera.com) and I [captured the flag](https://blog.credera.com/topic/technology-solutions/hacking-for-fun-stripes-capture-the-flag-2-0/) on Stripe's CTF 2.0, and we actually employed this attack during the challenge. It wasn't the intended way to beat the level, but it worked nonetheless. For more information on how to actually fabricate a cookie to attack Sinatra apps, you can see the [blog post](http://blog.credera.com/topic/technology-solutions/stripes-capture-the-flag-2-0-bonus/).

## Three common protection strategies against session fixation

Now that we've seen a few different ways to steal a session id, we can talk about some techniques to secure a website.

### Don't use sessions

Just kidding.

### Only use HTTPS

This is a viable strategy and is used by many popular websites. For example, Facebook will now only serve you pages via HTTPS, which prevents any fixation from happening as all traffic is encrypted (including the session id) and cannot be decoded by a third party. Of course, this has the downside that all traffic must be served via HTTPS, which increases processing overhead, network traffic, and makes caches much less effective. For many sites that deal with sensitive information, this is an acceptable cost, but is there a better way?

### Once a user logs in, enforce HTTPS for future traffic

I would estimate that this is the most popular mechanism to prevent hijacking (and for good reason, because it's a pretty good one). With this strategy, you concede to showing users pages via HTTP as you normally would. However, once they authenticate, you invalidate their previous HTTP session and switch over to an HTTPS session. This means that every single page they see after they login must be HTTPS. This is the default Spring session fixation protection mechanism, but again, is there a better way?

### Secure HTTPS traffic with a secondary cookie

We've finally reached what I think is an excellent compromise between encrypting everything and encrypting nothing. We begin by establishing a normal HTTP session for a user when they first visit the site and allow them to view pages over HTTP. However, as soon as the user sees an HTTPS page, we set a secondary, HTTPS session id cookie without invalidating their previous session. Once the HTTPS cookie is set, every time that user requests an HTTPS, we validate not only the normal session id cookie, but also the secondary one. Therefore, a session hijacker would not be able to see any information that is served through HTTPS, as all sensitive information and actions should be!

> Note that Broadleaf will set this cookie as soon as an HTTPS page is seen (vs the default Spring way of setting it once a user logs in). This gives us the added benefit of providing session fixation protection for anonymous users as well as logged in users.

## Broadleaf's solution to session fixation attacks

As I'm sure you could guess, the default protection as of Broadleaf 2.0 relies on the third mechanism. Let's dive in to the actual implementation.

### Create our Spring Security filter

Let's take a look at some important snippets from [SessionFixationProtectionFilter.java](https://github.com/BroadleafCommerce/BroadleafCommerce/blob/master/core/broadleaf-profile-web/src/main/java/org/broadleafcommerce/profile/web/core/security/SessionFixationProtectionFilter.java)

```java
public void doFilter(ServletRequest sRequest, ServletResponse sResponse, FilterChain chain)
    throws IOException, ServletException {

  // If there is no security context, we obviously don't need to do anything
  if (SecurityContextHolder.getContext() == null) {
    chain.doFilter(request, response);
  }

  // This represents the value we expect the HTTPS cookie to be set to
  String activeIdSessionValue = (String) session.getAttribute(SESSION_ATTR);

  if (StringUtils.isNotBlank(activeIdSessionValue) && request.isSecure()) {
    // The request is secure and and we've previously set a session
    // fixation protection cookie

    String activeIdCookieValue = SessionFixationProtectionCookie.readActiveID(request);
    String decryptedActiveIdValue = encryptionModule.decrypt(activeIdCookieValue);

    if (!activeIdSessionValue.equals(decryptedActiveIdValue)) {
      abortUser(request, response); // Invalidate the session and clear their cookies
    }
  } else if (request.isSecure()) {
    // The request is secure, but we haven't set a session fixation protection cookie yet

    String token;
    try {
      token = RandomGenerator.generateRandomId("SHA1PRNG", 32);
    } catch (NoSuchAlgorithmException e) {
      throw new ServletException(e);
    }

    // Note that since our value is completely random, this encryption is not
    // necessary. However, if you were to use user-identifying data as your secondary
    // cookie value, you would definitely want to encrypt it.
    String encryptedAIDValue = encryptionModule.encrypt(token);

    // Save the value into the session
    session.setAttribute(SESSION_ATTR, token);

    // Save the HTTPS cookie for the user
    SessionFixationProtectionCookie.writeActiveID(request, response, encryptedAIDValue);
  }

  chain.doFilter(request, response);
}
```

### Configure security to trigger this filter

In `applicationContext-security.xml`, we first disable the default Spring method of preventing session hijacking:

```xml
<sec:session-management session-fixation-protection="none" />
```

and then we add our custom filter to the chain:

```xml
<sec:custom-filter ref="blSessionFixationProtectionFilter" before="SESSION_MANAGEMENT_FILTER"/>
```

## Closing remarks

All in all, it's a pretty easy exercise to plug in this method of session fixation protection. It's configured this way by default in Broadleaf, but as I'm sure you can see, it'd be extremely easy to duplicate in any other app that utilizes Spring Security. Being aware of the security precautions the frameworks you use take is important, and we plan on detailing out more of our approaches to security in the future.
