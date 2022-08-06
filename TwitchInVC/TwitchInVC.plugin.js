/**
 * @name TwitchInVC
 * @version 0.0.1
 * @author SmolAlli
 *
 */

module.exports = (() => {
    const config = {
        info: {
            name: "TwitchInVC",
            authors: [
                {
                    name: "SmolAlli",
                    github_username: "SmolAlli",
                },
            ],
            version: "0.0.1",
            description:
                "Changes the name colours of people in VC if they are live on Twitch",
        },
        main: "index.js",
    };

    return !global.ZeresPluginLibrary
        ? class {
              constructor() {
                  this._config = config;
              }
              getName() {
                  return config.info.name;
              }
              getAuthor() {
                  return config.info.authors;
              }
              getDescription() {
                  return config.info.description;
              }
              getVersion() {
                  return config.info.version;
              }
              load() {
                  BdApi.showConfirmationModal(
                      "Library Missing",
                      `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
                      {
                          confirmText: "Download Now",
                          cancelText: "Cancel",
                          onConfirm: () => {
                              require("request").get(
                                  "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                                  async (error, response, body) => {
                                      if (error)
                                          return require("electron").shell.openExternal(
                                              "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                                          );
                                      await new Promise((r) =>
                                          require("fs").writeFile(
                                              require("path").join(
                                                  BdApi.Plugins.folder,
                                                  "0PluginLibrary.plugin.js"
                                              ),
                                              body,
                                              r
                                          )
                                      );
                                  }
                              );
                          },
                      }
                  );
              }
              start() {}
              stop() {}
          }
        : (([Plugin, Api]) => {
              const plugin = (Plugin, Api) => {
                  const TwitchColour = "#9146ff";
                  const { WebpackModules, DiscordModules, Patcher, Utilities } =
                      Api;

                  const GuildMemberStore = DiscordModules.GuildMemberStore;
                  const SelectedGuildStore = DiscordModules.SelectedGuildStore;
                  const VoiceUser =
                      WebpackModules.getByDisplayName("VoiceUser");

                  return class TwitchInVC extends Plugin {
                      onStart() {
                          Utilities.suppressErrors(
                              this.patchVoiceUsers.bind(this),
                              "voice users patch"
                          )();
                          this.promises = {
                              state: { cancelled: false },
                              cancel() {
                                  this.state.cancelled = true;
                              },
                          };
                      }

                      onStop() {
                          Patcher.unpatchAll();
                          this.promises.cancel();
                          if (this.unpatchAccountDetails) {
                              this.unpatchAccountDetails();
                              delete this.unpatchAccountDetails;
                          }
                      }

                      getSettingsPanel() {
                          return this.buildSettingsPanel().getElement();
                      }

                      getMember(userId, guild = "") {
                          const guildId =
                              guild || SelectedGuildStore.getGuildId();
                          if (!guildId) return null;
                          const member = GuildMemberStore.getMember(
                              guildId,
                              userId
                          );
                          if (!guildId) return null;
                          return member;
                      }

                      patchVoiceUsers() {
                          Patcher.after(
                              VoiceUser.prototype,
                              "renderName",
                              (thisObject, _, returnValue) => {
                                  if (!returnValue || !returnValue.props)
                                      return;

                                  const GetStatus = BdApi.findModuleByProps(
                                      "getStatus",
                                      "getState"
                                  );

                                  const UserActivities =
                                      GetStatus.getActivities(
                                          thisObject.props.user.id
                                      );
                                  let isOnTwitch = false;
                                  UserActivities.forEach((elem) => {
                                      if (elem.name === "Twitch") {
                                          isOnTwitch = true;
                                      }
                                  });
                                  
                                  // If you want to test that the plugin is working, 
                                  // disable this line below and check if all people in VC are now purple
                                  if (!isOnTwitch) return;
                                  
                                  returnValue.props.style = {
                                      color: TwitchColour,
                                      backfaceVisibility: "hidden",
                                  };
                                  returnValue.ref = (element) => {
                                      if (!element) return;
                                      element.style.setProperty(
                                          "color",
                                          TwitchColour,
                                          "important"
                                      );
                                  };
                              }
                          );
                      }
                  };
              };
              return plugin(Plugin, Api);
          })(global.ZeresPluginLibrary.buildPlugin(config));
})();
