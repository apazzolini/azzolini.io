export const routes = [
  { method: 'GET', path: '/info',
    handler: (request, reply) => {
      reply({
        message: 'This came from the api server',
        time: Date.now()
      });
    }
  },
];

