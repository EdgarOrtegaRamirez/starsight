export class Octokit {
  constructor() {
    // Mock — no real API calls
  }

  rest = {
    activity: {
      listReposStarredByUser: async ({ username, per_page, page, direction, sort }: any) => {
        return {
          data: [],
          headers: { link: '' },
        };
      },
    },
    users: {
      getAuthenticated: async () => {
        return {
          data: {
            login: 'testuser',
            name: 'Test User',
          },
        };
      },
    },
  };
}

export default Octokit;