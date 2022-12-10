var app = new Vue({
  el: "#app",
  data: {
    alert: {
      variant: "danger",
      show: false,
      text: ""
    },
    loading: {
      show: false,
      text: "Loading"
    },
    httpClient: null,
    menu: 1,
    twitch_config: {
      user: {
        id: "",
        login: "",
        name: "",
        icon: ""
      },
      client_id: "ex4s5g39esd8d4gz7d881sx2ih5vpv",
      access_token: "",
    },
    config_edit: {},
    config: {},
    rewards: [],
    rewards_edit: [],
    queue: [],
    osc_process: null,
    osc_result: [],
    twitch_ws: {
      connect: false,
      client: null,
    },
  },
  created: function () {
    this.initAxios();
    this.initApp();
  },
  computed: {
  },
  watch: {
    menu: function () {
      if (this.menu == 99) {
        this.config_edit =  JSON.parse(JSON.stringify(this.config));
      } else if (this.menu == 1) {
        this.rewards_edit =  JSON.parse(JSON.stringify(this.rewards));
      }
    },
  },
  mounted: function () {
  },
  methods: {
    // axiosセットアップ
    initAxios() {
      axios.defaults.headers.post["Content-Type"] = "application/json";
      this.httpClient = axios.create({
        timeout: 0
      });
    },
    // 初期化
    initApp() {
      window.myapi.getConfig().then(r => {
        this.config = r;
        this.config_edit = r;
        this.startOSCHeartBeat();
      });
      window.myapi.getRewards().then(r => {
        this.rewards = r;
        this.rewards_edit = r;
      });
      setTimeout(this.initTwitch(), 1000)
    },
    // Alert表示
    showAlert(text, variant) {
      if (text && variant) {
        this.alert.text = text;
        this.alert.variant = variant;
        this.alert.show = true;
        setTimeout(this.hideAlert, 5000);
      }
    },
    // Alert非表示
    hideAlert() {
      this.alert.text = "";
      this.alert.show = false;
    },
    // Loading表示
    showLoading(text) {
      if (text) {
        this.loading.text = text;
      }
      this.loading.show = true;
    },
    // Loading非表示
    hideLoading() {
      this.loading.text = "";
      this.loading.show = false;
    },
    // Twitch接続
    connectTwitch() {
      let client = new WebSocket("wss://eventsub-beta.wss.twitch.tv/ws");
      let _this = this;
      client.onopen = function(event) {
        
      };
      client.onclose = function() {
        _this.twitch_ws.connect = false;
      };
      client.onmessage = function(event) {
        const message = JSON.parse(event.data);
        const message_type = message.metadata.message_type;
        switch (message_type) {
          case "session_welcome":
            // サブスクライブ
            _this.createTwitchSubscribe(message.payload.session.id)
            break;
          case "notification":
            // 通知
            _this.addTwitchQueue(message.payload.event.reward.id);
            break;
          default:
        }
      };
      this.twitch_ws.client = client;
    },
    // Twitch切断
    disconnectTwitch() {
      if (this.twitch_ws.connect) {
        this.twitch_ws.client.close();
        this.twitch_ws.client = null;
      }
    },
    // Twitch カスタム報酬 Queue追加
    addTwitchQueue(reward_id) {
      const target = this.rewards.filter(r => r.config.is_enabled).filter(r => r.id == reward_id);
      if (target.length > 0) {
        let unixtime = new Date().getTime();
        if (target[0].config.blendshapes.length > 0) {
          const already_queue = this.queue.filter(r => r.id == reward_id);
          if (already_queue.length > 0) {
            // すでにキューがある(期限を延ばして入れ直す)
            const queue = already_queue[0];
            queue.expired += (target[0].config.duration * 1000);
            this.queue = this.queue.filter(r => r.id != reward_id);
            this.queue.push(queue);
          } else {
            // キューがない
            this.queue.push({
              id: target[0].id,
              title: target[0].title,
              blendshapes: target[0].config.blendshapes,
              expired: unixtime + (target[0].config.duration * 1000),
            });
          }
        }
      }
    },
    startOSCHeartBeat() {
      this.osc_process = setInterval(this.sendOSC, this.config.osc.interval);
    },
    reStartOSCHeartBeat() {
      this.showLoading("ReStarting...");
      if (this.osc_process != null) {
        clearInterval(this.osc_process);
        this.osc_process = null;
      }
      this.startOSCHeartBeat();
      this.hideLoading();
    },
    // QueueからOSCで送信
    sendOSC() {
      if (this.queue.length > 0) {
        let unixtime = new Date().getTime();
        let blendshapes = [];
        this.queue.forEach(q => {
          const is_expired = q.expired <= unixtime;
          q.blendshapes.forEach(bs => {
            blendshapes.push({
              name: bs.name,
              value: is_expired ? '0' : bs.value
            })
          });
        });

        // 期限外を削除
        this.queue = this.queue.filter(q => q.expired > unixtime);
        window.myapi.sendOSC(this.config.osc.ip, this.config.osc.port, blendshapes).then(r => {
          this.osc_result = r;
        })
      }
    },
    getTwitchHeader() {
      return {
        "Authorization": "Bearer " + this.twitch_config.access_token,
        "Client-Id": this.twitch_config.client_id
      };
    },
    initTwitch() {
      window.myapi.getTwitchConfig().then(r => {
        this.twitch_config.access_token = r.access_token;
        const url = "https://api.twitch.tv/helix/users";
        this.httpClient.get(url, {headers: this.getTwitchHeader()}).then((response) => {
          if (response.data.data.length > 0) {
            this.twitch_config.user = {
              id: response.data.data[0].id,
              login: response.data.data[0].login,
              name: response.data.data[0].display_name,
              icon: response.data.data[0].profile_image_url
            };
            // 自動接続
            if (this.config.twitch.auto_connect) {
              this.connectTwitch();
            }
          }
        });
      })
    },
    createTwitchSubscribe(id) {
      this.showLoading("Loading...");
      const params = {
        type: "channel.channel_points_custom_reward_redemption.add",
        version: "1",
        condition: {
          broadcaster_user_id: this.twitch_config.user.id
        },
        transport: {
          method: "websocket",
          session_id: id
        },
      };
      const url = "https://api.twitch.tv/helix/eventsub/subscriptions";
      this.httpClient.post(url, params, {headers: this.getTwitchHeader()}).then((response) => {
        this.twitch_ws.connect = true;
        this.hideLoading();
      });  
    },
    getCustomRewards() {
      this.showLoading("Loading...");
      const params = {
        broadcaster_id: this.twitch_config.user.id,
      };
      const url = "https://api.twitch.tv/helix/channel_points/custom_rewards?" + new URLSearchParams(params).toString();
        this.httpClient.get(url, {headers: this.getTwitchHeader()}).then((response) => {
          let rewards = [];
          let rewards_edit = [];
          
          response.data.data.forEach(a => {
            if (a.should_redemptions_skip_request_queue) {

              let reward = {
                id: a.id,
                is_enabled: a.is_enabled,
                title: a.title,
                prompt: a.prompt,
                cost: a.cost,
                image: a.image ? a.image.url_4x : a.default_image.url_4x,
                background_color: a.background_color
              };
              
              const _reward = this.rewards.filter(c => c.id === reward.id);
              if (_reward.length == 1) {
                // ある！
                reward.config = _reward[0].config;
              } else {
                // ない！
                reward.config = {
                  is_enabled: false,
                  blendshapes: [],
                  duration: 1000,
                  accordion: 0,
                };
              }
              rewards.push(reward);
            }
          });

          response.data.data.forEach(a => {
            if (a.should_redemptions_skip_request_queue) {
              let reward = {
                id: a.id,
                is_enabled: a.is_enabled,
                title: a.title,
                prompt: a.prompt,
                cost: a.cost,
                image: a.image ? a.image.url_4x : a.default_image.url_4x,
                background_color: a.background_color
              }
              const _reward = this.rewards_edit.filter(c => c.id === reward.id);
              if (_reward.length == 1) {
                // ある！
                reward.config = _reward[0].config;
              } else {
                // ない！
                reward.config = {
                  is_enabled: false,
                  blendshapes: [],
                  duration: 1000,
                  accordion: 0,
                };
              }
              rewards_edit.push(reward);
            }
          });
          this.rewards = rewards;
          this.rewards_edit = rewards_edit;
          this.hideLoading();
        });
    },
    resetCustomRewards() {
      this.showLoading("Loading...");
      this.rewards_edit =  JSON.parse(JSON.stringify(this.rewards));
      this.getCustomRewards();
    },
    addBlendShape(config) {
      config.blendshapes.push({
        id: "bs-" + Math.random().toString(32).substring(2),
        name: "",
        value: 0,
      });
    },
    deleteBlendShape(id ,config) {
      config.blendshapes = config.blendshapes.filter(b => {
        return b.id != id;
      });
    },
    saveConfig() {
      this.showLoading("Saving...");
      window.myapi.saveConfig(this.config_edit).then(r => {
        if(r) {
          this.config = JSON.parse(JSON.stringify(this.config_edit))
          this.showAlert("保存しました。", "success");
        } else {
          // error
          this.showAlert("保存に失敗しました。", "danger");
        }
        this.hideLoading();
      })
    },
    saveRewards() {
      this.showLoading("Saving...");
      window.myapi.saveRewards(this.rewards_edit).then(r => {
        if(r) {
          this.rewards = JSON.parse(JSON.stringify(this.rewards_edit))
          this.showAlert("保存しました。", "success");
        } else {
          // error
          this.showAlert("保存に失敗しました。", "danger");
        }
        this.hideLoading();
      })
    }
  }
});