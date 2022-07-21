/*
  Notes:
    - I assume there is a typo in the task description and `posts` property should be an array (based on User type)
      `
        const userSelect: Select<User> = {
          id: true,
          name: true,
          posts: { <=== array instead of object
              id: true,
              text: true
          }
        }
      `
    - In order to see multiple type errors (marked with comments) 
      you need to comment out or remove some other error(s)
*/

type Select<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<Select<U>>
    : T[P] extends { [key: string]: any }
    ? Select<T[P]>
    : boolean;
};

type User = {
  id: string;
  name: string;
  posts: Post[];
};

type Post = {
  id: string;
  text: string;
  user: User;
};

const userSelect: Select<User> = {
  id: true,
  name: true,
  posts: [
    {
      id: true,
      text: true,
      user: {
        id: true,
      },
    },
  ],
};

const postSelect: Select<Post> = {
  id: true,
  text: true,
  user: {
    id: true,
    name: true,
  },
};

/* - */

const userSelectIncorrect: Select<User> = {
  id: true,
  name: true,
  notCorrectTypeField: 'hello', // highlights error
  nonExistentField: true, // highlights error
  posts: [
    {
      id: true,
      text: true,
    },
  ],
};

const userSelectCorrect: Select<User> = {
  id: true,
  name: true,
  posts: [
    {
      id: true,
      text: true,
      user: {
        id: true,
        name: true,
        posts: [{ id: true }],
      },
    },
  ],
};

/* */

const postSelectIncorrect: Select<Post> = {
  id: true,
  text: true,
  nonExistentField: true, // highlights error
  notCorrectTypeField: 'hello', // highlights error
  user: {
    id: true,
    notCorrectTypeNestedField: 'hello', // highlights error
    name: true,
  },
};

const postSelectCorrect: Select<Post> = {
  id: true,
  text: true,
  user: {
    id: true,
    name: true,
    posts: [{ id: true }],
  },
};
