import osjs from 'osjs';
import {name as applicationName} from './metadata.json';

import * as languages from './locales';

const reqFactory = proc => (url,body,method='get') => proc.request('/api/'+url,{ method, body });

class Discord {
  constructor(req,token) {
    this.token = token;
  }
}

const createWindow = (proc,metadata,_) => {
  const req = reqFactory(proc);
  return proc.createWindow({
    id: 'DiscordWindow',
    title: _('TITLE'),
		icon: proc.resource(metadata.icon),
    dimension: {width: 400, height: 400}
  }).render();
};

const createTray = (core,proc,metadata,_) => {
  const req = reqFactory(proc);
  let win = createWindow(proc,metadata,_);
  const entry = core.make('osjs/tray',{
    title: _('TITLE'),
		icon: proc.resource(metadata.icon),
		oncontextmenu: ev => {
      ev.stopPropagation();
      ev.preventDefault();
		  core.make('osjs/contextmenu',{
		    position: ev.target,
		    menu: [
		      { label: _('OPEN_DISCORD'), onclick: () => {
		        if(win == null) {
		          win = createWindow(proc,metadata,_);
		          win.on('destroy',() => { win = null; });
		        } else {
		          win.raise();
		          win.focus();
		        }
		      } },
		      { type: 'separator' },
		      { label: _('QUIT'), onclick: () => proc.destroy() }
		    ]
		  });
		}
  });
  proc.on('destroy',() => entry.destroy());
};

const register = (core,args,options,metadata) => {
  const proc = core.make('osjs/application',{args,options,metadata});
  const {translatable} = core.make('osjs/locale');
  const _ = translatable(languages);
  if(typeof(proc.settings.token) == 'undefined') {
    /* TODO: show login dialog before */
    window.open('https://discordapp.com/api/oauth2/authorize?response_type=code&client_id='+core.config().discord.client_id+'&scope='+[
      'connections',
      'identify',
      'guilds',
      'guilds.join',
      'gdm.join',
      'messages.read',
      'rpc',
      'rpc.api',
      'rpc.notifications.read'
    ].join('%20')+'&redirect_uri='+(location.href+proc.resource('/oauth2').replace('/','')).split(':').join('%3A').split('/').join('%2F'));
    core.make('osjs/dialog','prompt',{
      message: _('LOGIN'),
      window: { icon: proc.resource(metadata.icon), title: _('TITLE') },
    },(btn,value) => {
      if(btn == 'ok') {
        proc.settings.token = value;
        proc.saveSettings();
        createTray(core,proc,metadata,_);
        return true;
      } else proc.destroy();
    });
  } else createTray(core,proc,metadata,_);
  return proc;
};
osjs.register(applicationName,register);
