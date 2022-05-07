---
title: Working in Linux in OS X
date: 2022-05-08
published: true
---

I do all of my work SSHed into a Linux VM running on my MacBook. Somehow, it's more responsive than working in OS X directly.
Here's what happens if we profile the startup time of Neovim opening a file in the Neovim repository:

While the numbers aren't huge, it's clearly visibly noticeable:

[img]

And it's not just Neovim - here's lazygit:

[img]

Even a simple `git status` is noticeably faster:

[img]

### Why even care?

Honestly, it's just distracting.
