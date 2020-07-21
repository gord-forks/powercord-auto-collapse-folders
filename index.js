const { Plugin } = require('powercord/entities')
const { getModule } = require('powercord/webpack')

const CurrentGuildStore = getModule(['getLastSelectedGuildId'], false)
const SortedGuildStore = getModule(['getSortedGuilds'], false)
const GuildActions = getModule(['toggleGuildFolderExpand'], false)
const GuildFolderStore = getModule(['getExpandedFolders'], false)


class AutoCollapseFolders extends Plugin {
  constructor () {
    super()

    this._changeListener = () => {
      const prevGuildID = this._currentGuildID
      const currGuildID = CurrentGuildStore.getLastSelectedGuildId()

      const currFolderID = this.getFolderIDFromGuildID(currGuildID)

      if (currFolderID && !GuildFolderStore.isFolderExpanded(currFolderID)) {
        setTimeout(() => {
          GuildActions.toggleGuildFolderExpand(currFolderID)
        }, 500)
      }

      if (prevGuildID) {
        setTimeout(() => {
          for (const folder of this.getFolders()) {
            if (folder.folderId !== currFolderID && GuildFolderStore.isFolderExpanded(folder.folderId)) {
              GuildActions.toggleGuildFolderExpand(folder.folderId)
            }
          }
        }, 500)
      }

      this._currentGuildID = currGuildID
    }
  }

  startPlugin () {
    this._currentGuildID = CurrentGuildStore.getLastSelectedGuildId()
    CurrentGuildStore.addChangeListener(this._changeListener)
  }

  pluginWillUnload () {
    CurrentGuildStore.removeChangeListener(this._changeListener)
  }

  getFolders () {
    return SortedGuildStore.guildFolders.filter((f) => f.folderId)
  }

  getFolderIDFromGuildID (guildID) {
    for (const folder of SortedGuildStore.guildFolders) {
      if (!folder.folderId) { continue }
      if (folder.guildIds.includes(guildID)) { return folder.folderId }
    }
  }
}

module.exports = AutoCollapseFolders
