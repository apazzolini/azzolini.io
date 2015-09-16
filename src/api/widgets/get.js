import Joi from 'joi';
import Boom from 'boom';

const initialWidgets = [
  {id: 1, color: 'Red', sprocketCount: 7, owner: 'John'},
  {id: 2, color: 'Taupe', sprocketCount: 1, owner: 'George'},
  {id: 3, color: 'Green', sprocketCount: 8, owner: 'Ringo'},
  {id: 4, color: 'Blue', sprocketCount: 2, owner: 'Paul'}
];

export function getWidgets() {
  return [ ...initialWidgets ];
}

export function getWidget(id) {
  return initialWidgets[id - 1];
}

export const routes = [
  {
    path: '/widgets', method: 'GET', handler: (request, reply) => {
      setTimeout(() => {
        if (Math.floor(Math.random() * 3) === 0) {
          reply(Boom.badImplementation('Widget load fails 33% of the time. You were unlucky.'));
        } else {
          reply(getWidgets());
        }
      }, 1000);
    }
  },

  {
    path: '/widgets/{id}', method: 'GET', handler: (request, reply) => {
      setTimeout(() => {
        reply(getWidget(request.params.id));
      }, 1000);
    },
    config: {
      validate: {
        params: {
          id: Joi.number().min(1).required()
        }
      }
    }
  }
];
