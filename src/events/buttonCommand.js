const { BUTTON_COMMAND } = require("./definitions");

module.exports = async (ws, command) => {
  if (!ws.user || !command) return;
  const { emitEvent } = require("../controllers/robotChannels");

  const { publicUser, getUserInfoFromId } = require("../models/user");
  const { validateInput } = require("../controllers/controls");
  command.user = publicUser(ws.user);

  //TODO: Consider storing local status per user session & doing checks at the auth level

  if (
    !ws.user.localStatus ||
    ws.user.localStatus.server_id !== command.server
  ) {
    const {
      checkMembership,
      createMember,
    } = require("../models/serverMembers");

    let getLocalStatus = await checkMembership({
      server_id: command.server,
      user_id: ws.user.id,
    });
    if (!getLocalStatus) {
      getLocalStatus = await createMember({
        user_id: ws.user.id,
        server_id: command.server,
      });
    }
    ws.user.localStatus = getLocalStatus.status;
  }

  const checkStatus = await getUserInfoFromId(ws.user.id);

  const globalExpire = parseInt(checkStatus.status.expireTimeout) || 0;
  const localExpire = ws.user.localStatus.expireTimeout || 0;

  if (globalExpire > Date.now() || localExpire > Date.now()) return;

  const check = await validateInput(command);
  if (check.validated) {
    emitEvent(command.channel, BUTTON_COMMAND, command);
  }
};
