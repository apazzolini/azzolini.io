import Joi from 'joi';
import {docs} from '../db';

const isAdmin = (request) => !!request.auth.isAuthenticated;

export const routes = [
  {
    path: '/docs', method: 'GET', handler: async (request, reply) => {
      return await docs.getAllByType(request.query.type);
    },
    query: {
      type: Joi.string()
    }
  },

  {
    path: '/docs/{id}', method: 'GET', handler: async (request, reply) => {
      return await docs.getById(request.params.id, isAdmin(request));
    },
    params: {
      id: Joi.string().length(24).hex().required()
    }
  },

  // TODO: 'session' is unclear as to what it means for auth
  {
    path: '/docs/{id}', method: 'POST', handler: async (request, reply) => {
      return await docs.save(request.params.id, request.payload);
    },
    auth: 'session',
    params: {
      id: Joi.string().length(24).hex().required()
    }
  },

  {
    path: '/docs/{id}', method: 'DELETE', handler: async (request, reply) => {
      return await docs.remove(request.params.id);
    },
    auth: 'session',
    params: {
      id: Joi.string().length(24).hex().required()
    }
  },

  {
    path: '/docs/{type}/{slug}', method: 'GET', handler: async (request, reply) => {
      return await docs.getBySlug(request.params.type, request.params.slug, isAdmin(request));
    },
    params: {
      type: Joi.string(),
      slug: Joi.string()
    }
  },

  {
    path: '/docs/{type}/create', method: 'POST', handler: async (request, reply) => {
      return await docs.create(request.params.type);
    },
    auth: 'session',
    params: {
      type: Joi.string().required()
    }
  }
];
