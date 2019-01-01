---
type: post
title: Creating a React + canvas 2d match replay tool for PUBG
---

Playerunknown's Battlegrounds (PUBG) is a popular online Battle Royale game where 100 people parachute to an island, search for weapons and items, and attempt to be the last man standing. The game developers provide a [public API](https://documentation.playbattlegrounds.com/en/introduction.html), and one of the endpoints provides telemetry data of every game that's played. The data is rather good and guarantees at least one player datapoint per 10 seconds, which enables rendering this:

[IMAGE HERE]

In this blog series, I'll be walking through the entire frontend and backend codebases as well as how the application is deployed. This was a fun project to build, and I'm enjoying maintaining and improving it.

- **Part 1: Overview**
- [Part 2: GraphQL backend]()
- [Part 3: React + Canvas (with Konva.js) frontend]()
- [Part 4: Deployment]()

## Overview

The backend is effectively a large caching layer on top of PUBG's APIs that pulls out relevant data and surfaces it to the client via GraphQL using Apollo and Hapi. It never requests the same data from PUBG twice, and I expire the data from my PostgreSQL database as it's expired from PUBG's API - this keeps the size down and ensures we never guide the user to a non-existent match.

Once the user's chosen a match, the remainder of the interaction happens client side - the telemetry data itself is provided via a separate endpoint, and it's only ever called by the client. After parsing the raw telemetry data in a web worker, we render the match using canvas and [konvajs/react-konva](https://github.com/konvajs/react-konva). I have a high bar for performance, and part three will include my path to reaching a constant 60fps during playback.

The final part in the series will discuss how the application is deployed (GitHub webhooks) and served (nginx / Docker). It's a simple and developer friendly CI/CD pipeline, and has been the perfect solution for a small single developer project.

