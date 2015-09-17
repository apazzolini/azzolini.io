import React, {Component} from 'react';

export default class About extends Component {
  render() {
    require('./About.scss');

    return (
      <div className="container">
        <h2 className="header">Writing code is a craft.</h2>

        <section>
          <p>I'm a full-stack web developer currently living in Dallas, TX.</p>

          <p>I view programming as a craft to be appreciated not only for the end product, but for the code itself. There's a strong tie between the elegance and simplicity of a codebase and its correctness, performance, and ability to handle change.</p>

          <p>I love JavaScript and can't get enough of Node.JS and React.</p>
        </section>

        <section>
          <h6>Hire Me!</h6>

          <p>I'm available for part-time and full-time work ranging from setting up a new project's architecture and leading a development team to helping you get your prototype past the finish line to long-term team or solo development engagements.</p>

          <p><a href="mailto:apazzolini@gmail.com">Get in touch!</a></p>
        </section>

        <section>
          <h6>Experience</h6>

          <p>My career started at a boutique consulting firm in Dallas, TX, Credera. I then joined a startup, Broadleaf Commerce as one of the core engineers. These two jobs gave me great insight not only into how to deliver robust and scalable applications, but also the actual process of solving business problems through technology.</p>

          <p>I’ve architected and built systems ranging from small, single-purpose Ruby apps to multi-server eCommerce websites for Fortune 500 companies. In addition to engineering, I've performed devops roles and led development teams.</p>

          <p>Most recently, I've been freelancing and love keeping up with bleeding-edge technologies.</p>

          <p>I graduated from the University of Texas at Austin in 2010 with degrees in both Computer Science and Management Information Systems.</p>
        </section>
      </div>
    );
  }
}
