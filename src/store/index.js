import Vue from "vue";
import Vuex from "vuex";
import createPersistedState from "vuex-persistedstate";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: localStorage.getItem("auth-token") || "",
    status: "",
    username: "user",
    rooms: [],
    current_room: "",
    updateMessages: []
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    authStatus: (state) => state.status,
    getUsername: (state) => state.username,
    getRooms: (state) => state.rooms,
    getCurrentRoom: (state) => state.current_room,
    getupdateMessages:(state) => state.updateMessages,
  },
  mutations: {
    AUTH_REQUEST: (state) => {
      state.status = "loading";
    },
    AUTH_SUCCESS: (state, token) => {
      state.status = "success";
      state.token = token;
    },
    AUTH_ERROR: (state) => {
      state.status = "error";
    },
    SET_USERNAME: (state, username) => {
      state.username = username;
    },
    SET_ROOMS: (state, rooms) => {
      state.rooms = rooms;
    },
    SET_CURRENTROOM: (state, payload) => {
      state.current_room = payload;
    },
    SET_UPDATEMESSAGES: (state, payload) => {
      state.updateMessages.push(payload)
    }
  },
  actions: {
    ROOMS: ({ commit, dispatch }) => {
      return new Promise((resolve, reject) => {
        axios({ url: "api/dashboard/", method: "GET" })
          .then((resp) => {
            const rooms = resp.data;
            commit("SET_ROOMS", rooms);
            resolve(resp);
          })
          .catch((err) => {
            reject(err);
          });
      });
    },
    AUTH_REQUEST: ({ commit, dispatch }, user) => {
      return new Promise((resolve, reject) => {
        // The Promise used for router redirect in login
        commit("AUTH_REQUEST");
        axios({ url: "api/user/login", data: user, method: "POST" })
          .then((resp) => {
            const token = resp.data.token;
            localStorage.setItem("auth-token", token); // store the token in localstorage
            axios.defaults.headers.common["auth-token"] = token;
            commit("AUTH_SUCCESS", token);
            // you have your token, now log in your user :)
            dispatch("USER_REQUEST");
            const username = resp.data.username;
            commit("SET_USERNAME", username);
            resolve(resp);
          })
          .catch((err) => {
            commit("AUTH_ERROR", err);
            localStorage.removeItem("auth-token"); // if the request fails, remove any possible user token if possible
            reject(err);
          });
      });
    },
    AUTH_REGISTER: ({ commit, dispatch }, user) => {
      return new Promise((resolve, reject) => {
        // The Promise used for router redirect in login
        commit("AUTH_REQUEST");
        axios({ url: "api/user/register", data: user, method: "POST" })
          .then((resp) => {
            dispatch("USER_REQUEST");
            resolve(resp);
            dispatch("AUTH_REQUEST");
          })
          .catch((err) => {
            commit("AUTH_ERROR", err);
            reject(err);
          });
      });
    },
    AUTH_LOGOUT: ({ commit, dispatch }) => {
      return new Promise((resolve, reject) => {
        commit("AUTH_LOGOUT");
        localStorage.removeItem("auth-token"); // clear your user's token from localstorage
        // remove the axios default header
        delete axios.defaults.headers.common["auth-token"];
        resolve();
      });
    },
  },
  modules: {},
  plugins: [createPersistedState()],
});
