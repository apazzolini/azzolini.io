---
title: OpenEntityManagerInViewFilter and LazyInitializationException
date: 2011-07-27
published: true
---

## What's this filter?

A Spring filter that keeps the current EntityManagerFactory in the thread for the entirety of a request.

## When should i use it?

Basically, this filter is useful when you want to utilize Hibernate collections in the controller layer. Most people add this filter to their project by default or when they start seeing:

> org.hibernate.LazyInitializationException: failed to lazily initialize a collection of role: com.example.class.ListObject, no session or session was closed

## Why does this exception happen?

Let’s take a look at a use case that will demonstrate this exception: Pretend we have two classes, Activity and Participant. Here’s a simple sketch:

```java
public class Activity {
  @OneToMany
  protected List<Participant> participants;
  ...
}
```

Retrieving this class from the database in the layer where you have your EntityManager defined would present no problems. In this layer (most likely the DAO), you would be able to access the Activity’s name, as well as the lazily loaded list of Participants. However, if you did not explicitly access the participants in the DAO layer, returning the Activity object and attempting to iterate through the Participants later on would cause a lazy initialization exception.

## The Details

When you use Spring to inject an EntityManager bean in the DAO layer via the @PersistenceContext annotation, Spring will generate an EntityManager for you for the appropriate persistence unit via the EntityManagerFactory. You’re then able to utilize the EntityManager to retrieve an object from the database and iterate through lazily loaded collections. However, once you leave the scope of the DAO layer, the EntityManager gets destroyed.

## The Solution

Use Spring’s OpenEntityManagerInViewFilter. This is a filter you define in your web.xml which will allow an EntityManager to live for the duration of a request (in Tomcat, this means the life of the thread). By defining this filter for each of the persistence units in your application, you will be able to iterate through the collection of Participants in the controller (or even your view, like a JSP file) without generating a LazyInitializationException!

```xml
<filter>
  <filter-name>entityManagerInViewFilter</filter-name>
  <filter-class>org.springframework.orm.jpa.support.OpenEntityManagerInViewFilter</filter-class>
  <init-param>
    <param-name>entityManagerFactoryBeanName</param-name>
    <param-value>entityManagerFactory</param-value>
  </init-param>
</filter>

<filter-mapping>
  <filter-name>entityManagerInViewFilter</filter-name>
  <url-pattern>/*</url-pattern>
  <dispatcher>REQUEST</dispatcher>
</filter-mapping>
```

