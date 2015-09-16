## andreazzolini.com

This project holds the source code that drives my personal site, [andreazzolini.com](https://www.andreazzolini.com). The project initially started with a copy of [erikras/react-redux-universal-hot-example](https://github.com/erikras/react-redux-universal-hot-example), but most things have been pretty drastically changed.

Although it's completely over-engineered for a simple blog, a lot of care was taken in creating something that could be used as a production-ready system. It was also a great learning experience on the React/Redux/Hapi stack, which was the main motivation for deconstructing the entire project and reassembling to learn the intricacies of the interactions of the different components.

This repository is designed as a playground for me to test new technologies and I don't intend on releasing this as a "create-your-own" blog framework. However, it would not be difficult to strip the customizations on top of the base project structure as a bootstrap application.

### Files that shouldn't need to be tweaked

If using this repository as a bootstrap, feel free to ignore the following files as they do not hold any andreazzolini.com specific information:

- `bin/`
- `src/redux/middleware/`
- `src/redux/create.js`
- `src/utils/`
- `src/client.js`
- `src/server.js` --> the api, inert, and onPreResponse sections
- `webpack/`
- `karma.conf.js`

### Future Enhancements

While researching the *many* different ways to structure and deliver React applications, I identified a few different items that are on the right path, but in my opinion not quite mature enough to build a system around.

#### React Relay (and GraphQL)

These two components are definitely going to be a standard in data fetching in the future, but at the time I was creating my personal site, the frameworks weren't quite robust enough yet. There were no backing implementations of GraphQL to data stores, and more importantly, Relay was not yet supporting server-side rendering. I really like the coupling of data requirements with React compoments and would love to switch to Relay, but I don't feel it's the correct choice for a universal application yet.

#### Inline Styling

CSS is on a downturn, and inline styles appear to be the path forward with the advent of [Radium](https://github.com/FormidableLabs/radium) and [react-style](https://github.com/js-next/react-style). Unfortunately, both of these technologies had downsides when I encountered them. Radium has no bundling approach for CSS to deliver CDN-aware, cacheable stylesheets. Also, server-side rendering was broken due to the way vendor auto-prefixing works. React-style has both of these issues solved, but has an opinionated stance that CSS3 animations and simple states such as `:hover` should not be allowed.
