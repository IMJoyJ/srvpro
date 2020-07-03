(function() {
  // 标准库
  var CLIENT_check_vip, CLIENT_get_absolute_pos, CLIENT_get_authorize_key, CLIENT_get_kick_reconnect_target, CLIENT_get_partner, CLIENT_heartbeat_register, CLIENT_heartbeat_unregister, CLIENT_import_data, CLIENT_is_able_to_kick_reconnect, CLIENT_is_able_to_reconnect, CLIENT_is_banned_by_mc, CLIENT_is_player, CLIENT_kick, CLIENT_kick_reconnect, CLIENT_pre_reconnect, CLIENT_reconnect, CLIENT_reconnect_register, CLIENT_reconnect_unregister, CLIENT_send_pre_reconnect_info, CLIENT_send_reconnect_info, CLIENT_send_replays, CLIENT_send_vip_status, CLIENT_use_cdkey, Cloud_replay_ids, ROOM_all, ROOM_bad_ip, ROOM_ban_player, ROOM_clear_disconnect, ROOM_connected_ip, ROOM_find_by_name, ROOM_find_by_pid, ROOM_find_by_port, ROOM_find_by_title, ROOM_find_or_create_ai, ROOM_find_or_create_by_name, ROOM_find_or_create_random, ROOM_player_flee, ROOM_player_get_score, ROOM_player_lose, ROOM_player_win, ROOM_players_banned, ROOM_players_oppentlist, ROOM_players_scores, ROOM_unwelcome, ROOM_validate, Room, SERVER_clear_disconnect, SOCKET_flush_data, VIP_generate_cdkeys, _, addCallback, auth, badwords, ban_user, buff_main, buff_side, bunyan, card, cards, challonge, challonge_cache, challonge_module_name, challonge_queue_callbacks, chat_color, code, concat_name, config, cppversion, crypto, date, deck_name_match, default_config, default_data, dialogues, disconnect_list, dns, duel_log, e, exec, execFile, fs, geoip, get_callback, get_memory_usage, http, http_server, https, https_server, import_datas, imported, is_requesting, j, k, l, len, len1, len2, len3, len4, lflists, list, loadJSON, load_dialogues, load_dialogues_custom, load_tips, load_tips_zh, load_words, log, long_resolve_cards, m, memory_usage, merge, moment, mysql, mysql_sync, mysqldb, mysqldb_sync, n, net, o, oldbadwords, oldconfig, olddialogues, oldduellog, oldtips, oldwords, options, os, path, pgClient, pg_client, pg_query, plugin_filename, plugin_list, plugin_path, real_windbot_server_ip, rebooted, redis, redisdb, ref, ref1, ref2, refresh_challonge_cache, release_disconnect, report_to_big_brother, request, requestListener, res, result, roomlist, setting_change, setting_save, settings, side, spawn, spawnSync, spawn_windbot, sql, tips, url, users_cache, v, vip_info, wait_room_start, wait_room_start_arena, windbot_looplimit, windbot_process, windbots, words, ygopro, zlib;

  net = require('net');

  http = require('http');

  url = require('url');

  path = require('path');

  fs = require('fs');

  os = require('os');

  crypto = require('crypto');

  exec = require('child_process').exec;

  execFile = require('child_process').execFile;

  spawn = require('child_process').spawn;

  spawnSync = require('child_process').spawnSync;

  // 三方库
  _ = global._ = require('underscore');

  _.str = require('underscore.string');

  _.mixin(_.str.exports());

  request = require('request');

  bunyan = require('bunyan');

  log = global.log = bunyan.createLogger({
    name: "mycard"
  });

  moment = global.moment = require('moment');

  moment.updateLocale('zh-cn', {
    relativeTime: {
      future: '%s内',
      past: '%s前',
      s: '%d秒',
      m: '1分钟',
      mm: '%d分钟',
      h: '1小时',
      hh: '%d小时',
      d: '1天',
      dd: '%d天',
      M: '1个月',
      MM: '%d个月',
      y: '1年',
      yy: '%d年'
    }
  });

  import_datas = global.import_datas = ["abuse_count", "ban_mc", "vip", "vpass", "rag", "rid", "is_post_watcher", "retry_count", "name", "pass", "name_vpass", "is_first", "lp", "card_count", "is_host", "pos", "surrend_confirm", "kick_count", "deck_saved", "main", "side", "side_interval", "side_tcount", "selected_preduel", "last_game_msg", "last_game_msg_title", "last_hint_msg", "start_deckbuf", "challonge_info", "ready_trap", "join_time", "arena_quit_free", "replays_sent"];

  merge = require('deepmerge');

  loadJSON = require('load-json-file').sync;

  //heapdump = require 'heapdump'

  // 配置
  // 导入旧配置
  if (!fs.existsSync('./config')) {
    fs.mkdirSync('./config');
  }

  try {
    oldconfig = loadJSON('./config.user.json');
    if (oldconfig.tips) {
      oldtips = {};
      oldtips.file = './config/tips.json';
      oldtips.tips = oldconfig.tips;
      oldtips.tips_zh = [];
      fs.writeFileSync(oldtips.file, JSON.stringify(oldtips, null, 2));
      delete oldconfig.tips;
    }
    if (oldconfig.words) {
      oldwords = {};
      oldwords.file = './config/words.json';
      oldwords.words = oldconfig.words;
      fs.writeFileSync(oldwords.file, JSON.stringify(oldwords, null, 2));
      delete oldconfig.words;
    }
    if (oldconfig.dialogues) {
      olddialogues = {};
      olddialogues.file = './config/dialogues.json';
      olddialogues.dialogues = oldconfig.dialogues;
      olddialogues.dialogues_custom = {};
      fs.writeFileSync(olddialogues.file, JSON.stringify(olddialogues, null, 2));
      delete oldconfig.dialogues;
    }
    if (oldconfig.modules) {
      if (oldconfig.modules.tournament_mode && oldconfig.modules.tournament_mode.duel_log) {
        oldduellog = {};
        oldduellog.file = './config/duel_log.json';
        oldduellog.duel_log = oldconfig.modules.tournament_mode.duel_log;
        fs.writeFileSync(oldduellog.file, JSON.stringify(oldduellog, null, 2));
        delete oldconfig.oldduellog;
      }
    }
    oldbadwords = {};
    if (oldconfig.ban) {
      if (oldconfig.ban.badword_level0) {
        oldbadwords.level0 = oldconfig.ban.badword_level0;
      }
      if (oldconfig.ban.badword_level1) {
        oldbadwords.level1 = oldconfig.ban.badword_level1;
      }
      if (oldconfig.ban.badword_level2) {
        oldbadwords.level2 = oldconfig.ban.badword_level2;
      }
      if (oldconfig.ban.badword_level3) {
        oldbadwords.level3 = oldconfig.ban.badword_level3;
      }
    }
    if (!_.isEmpty(oldbadwords)) {
      oldbadwords.file = './config/badwords.json';
      fs.writeFileSync(oldbadwords.file, JSON.stringify(oldbadwords, null, 2));
      delete oldconfig.ban.badword_level0;
      delete oldconfig.ban.badword_level1;
      delete oldconfig.ban.badword_level2;
      delete oldconfig.ban.badword_level3;
    }
    if (!_.isEmpty(oldconfig)) {
      // log.info oldconfig
      fs.writeFileSync('./config/config.json', JSON.stringify(oldconfig, null, 2));
      log.info('imported old config from config.user.json');
    }
    fs.renameSync('./config.user.json', './config.user.bak');
  } catch (error1) {
    e = error1;
    if (e.code !== 'ENOENT') {
      log.info(e);
    }
  }

  setting_save = global.setting_save = function(settings) {
    fs.writeFileSync(settings.file, JSON.stringify(settings, null, 2));
  };

  setting_change = global.setting_change = function(settings, path, val) {
    var key, target;
    if (_.isString(val)) {
      // path should be like "modules:welcome"
      log.info("setting changed", path, val);
    }
    path = path.split(':');
    if (path.length === 0) {
      settings[path[0]] = val;
    } else {
      target = settings;
      while (path.length > 1) {
        key = path.shift();
        target = target[key];
      }
      key = path.shift();
      target[key] = val;
    }
    setting_save(settings);
  };

  VIP_generate_cdkeys = global.VIP_generate_cdkeys = function(key_type, count) {
    var i, j, key, ref;
    if (!(settings.modules.vip.enabled && vip_info.cdkeys[key_type])) {
      return false;
    }
    for (i = j = 0, ref = count; (0 <= ref ? j < ref : j > ref); i = 0 <= ref ? ++j : --j) {
      key = Math.floor(Math.random() * 10000000000000000).toString();
      vip_info.cdkeys[key_type].push(key);
    }
    setting_save(vip_info);
    log.info("keys generated", key_type, count, vip_info.cdkeys[key_type].length);
    return true;
  };

  CLIENT_use_cdkey = global.CLIENT_use_cdkey = function(client, pkey) {
    var current_date, found_type, index, j, key, keys, len, new_vip, ref, type;
    if (!(settings.modules.vip.enabled && pkey)) {
      return 0;
    }
    found_type = null;
    ref = vip_info.cdkeys;
    for (type in ref) {
      keys = ref[type];
// support web given format
      for (j = 0, len = keys.length; j < len; j++) {
        key = keys[j];
        if (!(pkey === key || pkey === (type + "D" + settings.port + ":" + key))) {
          continue;
        }
        found_type = parseInt(type);
        index = _.indexOf(keys, key);
        if (index !== -1) {
          keys.splice(index, 1);
        }
        break;
      }
      if (found_type) {
        break;
      }
    }
    if (!found_type) {
      return 0;
    }
    if (!vip_info.cdkeys[found_type].length) {
      VIP_generate_cdkeys(found_type, settings.modules.vip.generate_count);
    }
    client.vip = true;
    new_vip = false;
    if (vip_info.players[client.name]) {
      current_date = moment();
      if (current_date.isSameOrBefore(vip_info.players[client.name].expire_date)) {
        current_date = moment(vip_info.players[client.name].expire_date, 'YYYY-MM-DD HH:mm:ss');
      }
      vip_info.players[client.name].expire_date = current_date.add(found_type, 'd').format('YYYY-MM-DD HH:mm:ss');
    } else {
      if (!client.vpass) {
        client.vpass = Math.floor(Math.random() * 100000).toString();
      }
      vip_info.players[client.name] = {
        password: client.vpass,
        expire_date: moment().add(found_type, 'd').format('YYYY-MM-DD HH:mm:ss'),
        dialogues: {}
      };
      new_vip = true;
    }
    setting_save(vip_info);
    return (new_vip ? 1 : 2);
  };

  CLIENT_check_vip = global.CLIENT_check_vip = function(client) {
    if (!settings.modules.vip.enabled) {
      return false;
    }
    if (!vip_info.players[client.name]) {
      return false;
    }
    if (vip_info.players[client.name].password !== client.vpass) {
      return false;
    }
    return moment().isSameOrBefore(vip_info.players[client.name].expire_date);
  };

  CLIENT_send_vip_status = global.CLIENT_send_vip_status = function(client, display) {
    if (!settings.modules.vip.enabled) {
      return false;
    }
    if (client.vip) {
      if (display) {
        return ygopro.stoc_send_chat(client, "${vip_remain_part1}" + vip_info.players[client.name].expire_date + "${vip_remain_part2}", ygopro.constants.COLORS.BABYBLUE);
      } else {
        return ygopro.stoc_send_chat(client, "${vip_remain}", ygopro.constants.COLORS.BABYBLUE);
      }
    } else if (!vip_info.players[client.name] || vip_info.players[client.name].password !== client.vpass) {
      return ygopro.stoc_send_chat(client, "${vip_not_bought}", ygopro.constants.COLORS.RED);
    } else {
      return ygopro.stoc_send_chat(client, "${vip_expired_part1}" + vip_info.players[client.name].expire_date + "${vip_expired_part2}", ygopro.constants.COLORS.RED);
    }
  };

  concat_name = global.concat_name = function(name, num) {
    var count, res, temp;
    if (!name[num]) {
      return null;
    }
    res = name[num];
    temp = null;
    count = num + 1;
    while (true) {
      temp = name[count];
      if (!temp) {
        break;
      }
      res = res + " " + temp;
      count++;
    }
    return res;
  };

  // 读取配置
  default_config = loadJSON('./data/default_config.json');

  try {
    config = loadJSON('./config/config.json');
  } catch (error1) {
    config = {};
  }

  settings = global.settings = merge(default_config, config, {
    arrayMerge: function(destination, source) {
      return source;
    }
  });

  auth = global.auth = require('./ygopro-auth.js');

  //import old configs
  imported = false;

  //reset http.quick_death_rule from true to 1
  if (settings.modules.http.quick_death_rule === true) {
    settings.modules.http.quick_death_rule = 1;
    imported = true;
  }

  //import the old redis port
  if (settings.modules.cloud_replay.redis_port) {
    settings.modules.cloud_replay.redis.port = settings.modules.cloud_replay.redis_port;
    delete settings.modules.cloud_replay.redis_port;
    imported = true;
  }

  //import the old passwords to new admin user system
  if (settings.modules.http.password) {
    auth.add_user("olduser", settings.modules.http.password, true, {
      "get_rooms": true,
      "shout": true,
      "stop": true,
      "change_settings": true,
      "ban_user": true,
      "kick_user": true,
      "start_death": true
    });
    delete settings.modules.http.password;
    imported = true;
  }

  if (settings.modules.tournament_mode.password) {
    auth.add_user("tournament", settings.modules.tournament_mode.password, true, {
      "duel_log": true,
      "download_replay": true,
      "clear_duel_log": true,
      "deck_dashboard_read": true,
      "deck_dashboard_write": true
    });
    delete settings.modules.tournament_mode.password;
    imported = true;
  }

  if (settings.modules.pre_util.password) {
    auth.add_user("pre", settings.modules.pre_util.password, true, {
      "pre_dashboard": true
    });
    delete settings.modules.pre_util.password;
    imported = true;
  }

  if (settings.modules.update_util.password) {
    auth.add_user("update", settings.modules.update_util.password, true, {
      "update_dashboard": true
    });
    delete settings.modules.update_util.password;
    imported = true;
  }

  //import the old enable_priority hostinfo
  if (settings.hostinfo.enable_priority || settings.hostinfo.enable_priority === false) {
    if (settings.hostinfo.enable_priority) {
      settings.hostinfo.duel_rule = 3;
    } else {
      settings.hostinfo.duel_rule = 4;
    }
    delete settings.hostinfo.enable_priority;
    imported = true;
  }

  //import the old Challonge api key option
  if (settings.modules.challonge.api_key) {
    settings.modules.challonge.options.apiKey = settings.modules.challonge.api_key;
    delete settings.modules.challonge.api_key;
    imported = true;
  }

  //finish
  if (imported) {
    setting_save(settings);
  }

  // 读取数据
  default_data = loadJSON('./data/default_data.json');

  try {
    tips = global.tips = loadJSON('./config/tips.json');
    if (!tips.tips_zh) {
      tips.tips_zh = [];
      setting_save(tips);
    }
  } catch (error1) {
    tips = global.tips = default_data.tips;
    setting_save(tips);
  }

  try {
    words = global.words = loadJSON('./config/words.json');
  } catch (error1) {
    words = global.words = default_data.words;
    setting_save(words);
  }

  try {
    dialogues = global.dialogues = loadJSON('./config/dialogues.json');
    if (!dialogues.dialogues_custom) {
      dialogues.dialogues_custom = {};
      setting_save(dialogues);
    }
  } catch (error1) {
    dialogues = global.dialogues = default_data.dialogues;
    setting_save(dialogues);
  }

  try {
    badwords = global.badwords = loadJSON('./config/badwords.json');
  } catch (error1) {
    badwords = global.badwords = default_data.badwords;
    setting_save(badwords);
  }

  try {
    duel_log = global.duel_log = loadJSON('./config/duel_log.json');
  } catch (error1) {
    duel_log = global.duel_log = default_data.duel_log;
    setting_save(duel_log);
  }

  try {
    chat_color = global.chat_color = loadJSON('./config/chat_color.json');
  } catch (error1) {
    chat_color = global.chat_color = default_data.chat_color;
    setting_save(chat_color);
  }

  try {
    vip_info = global.vip_info = loadJSON('./config/vip_info.json');
  } catch (error1) {
    vip_info = global.vip_info = default_data.vip_info;
    setting_save(vip_info);
  }

  try {
    cppversion = parseInt(fs.readFileSync('ygopro/gframe/game.cpp', 'utf8').match(/PRO_VERSION = ([x\dABCDEF]+)/)[1], '16');
    setting_change(settings, "version", cppversion);
    log.info("ygopro version 0x" + settings.version.toString(16), "(from source code)");
  } catch (error1) {
    //settings.version = settings.version_default
    log.info("ygopro version 0x" + settings.version.toString(16), "(from config)");
  }

  // load the lflist of current date
  lflists = global.lflists = [];

  try {
    ref = fs.readFileSync('ygopro/expansions/lflist.conf', 'utf8').match(/!.*/g);
    // expansions/lflist
    for (j = 0, len = ref.length; j < len; j++) {
      list = ref[j];
      date = list.match(/!([\d\.]+)/);
      if (!date) {
        continue;
      }
      lflists.push({
        date: moment(list.match(/!([\d\.]+)/)[1], 'YYYY.MM.DD').utcOffset("-08:00"),
        tcg: list.indexOf('TCG') !== -1
      });
    }
  } catch (error1) {

  }

  try {
    ref1 = fs.readFileSync('ygopro/lflist.conf', 'utf8').match(/!.*/g);
    // lflist
    for (l = 0, len1 = ref1.length; l < len1; l++) {
      list = ref1[l];
      date = list.match(/!([\d\.]+)/);
      if (!date) {
        continue;
      }
      lflists.push({
        date: moment(list.match(/!([\d\.]+)/)[1], 'YYYY.MM.DD').utcOffset("-08:00"),
        tcg: list.indexOf('TCG') !== -1
      });
    }
  } catch (error1) {

  }

  if (settings.modules.cloud_replay.enabled) {
    zlib = require('zlib');
    if (settings.modules.cloud_replay.engine === 'redis') {
      redis = require('redis');
      redisdb = global.redisdb = redis.createClient(settings.modules.cloud_replay.redis);
      redisdb.on('error', function(err) {
        log.warn(err);
      });
    } else if (settings.modules.cloud_replay.engine === 'mysql') {
      mysql = require('mysql');
      mysql_sync = require('sync-mysql');
      mysqldb = global.mysqldb = mysql.createConnection(settings.modules.cloud_replay.mysql);
      mysqldb_sync = global.mysqldb_sync = new mysql_sync(settings.modules.cloud_replay.mysql);
      mysqldb.on('error', function(err) {
        log.warn(err);
      });
      global.dc_decks_main = new Array(100);
      global.dc_decks_side = new Array(100);
      global.dc_decks_md5 = new Array(100);
      global.dc_decks_index = 0;
      global.dc_decks_index_max = 100;
      sql = "SELECT * FROM RandomDecks ORDER BY RAND() LIMIT 100;";
      result = global.mysqldb_sync.query(sql);
      for (m = 0, len2 = result.length; m < len2; m++) {
        res = result[m];
        buff_main = [];
        buff_side = [];
        log.warn(res.content);
        cards = res.content.split(/[\r\n\t ]+/);
        side = false;
        for (n = 0, len3 = cards.length; n < len3; n++) {
          card = cards[n];
          code = parseInt(card.trim());
          if (!isNaN(code)) {
            if (!side) {
              buff_main.push(code);
            } else {
              buff_side.push(code);
            }
          } else if ((card.substring(0, 5)) === "!side") {
            side = true;
          }
        }
        dc_decks_main[global.dc_decks_index] = buff_main;
        dc_decks_side[global.dc_decks_index] = buff_side;
        global.dc_decks_index++;
      }
      global.dc_decks_index = 0;
    }
  }

  //sql = 'CREATE DATABASE ygo;'
  //mysqldb.query sql, sqlParams, (err, result)->
  //  if err
  //    log.info err
  //  return
  //sql = 'CREATE TABLE CloudReplay(ip VARCHAR(255), replayId BIGINT(20), replayBuffer BLOB, playerNames TEXT, saveDate TEXT);'
  //mysqldb.query sql, sqlParams, (err, result)->
  //  if err
  //    log.info err
  //  return
  if (settings.modules.windbot.enabled) {
    windbots = global.windbots = loadJSON(settings.modules.windbot.botlist).windbots;
    real_windbot_server_ip = global.real_windbot_server_ip = settings.modules.windbot.server_ip;
    if (!settings.modules.windbot.server_ip.includes("127.0.0.1")) {
      dns = require('dns');
      dns.lookup(settings.modules.windbot.server_ip, function(err, addr) {
        if (!err) {
          return real_windbot_server_ip = global.real_windbot_server_ip = addr;
        }
      });
    }
  }

  if (settings.modules.heartbeat_detection.enabled) {
    long_resolve_cards = global.long_resolve_cards = loadJSON('./data/long_resolve_cards.json');
  }

  // 组件
  ygopro = global.ygopro = require('./ygopro.js');

  if (settings.modules.http.websocket_roomlist) {
    roomlist = global.roomlist = require('./roomlist.js');
  }

  if (settings.modules.i18n.auto_pick) {
    geoip = require('geoip-country-lite');
  }

  // cache users of mycard login
  users_cache = {};

  if (settings.modules.mycard.enabled) {
    pgClient = require('pg').Client;
    pg_client = global.pg_client = new pgClient(settings.modules.mycard.auth_database);
    pg_client.on('error', function(err) {
      log.warn("PostgreSQL ERROR: ", err);
    });
    pg_query = pg_client.query('SELECT username, id from users');
    pg_query.on('error', function(err) {
      log.warn("PostgreSQL Query ERROR: ", err);
    });
    pg_query.on('row', function(row) {
      //log.info "load user", row.username, row.id
      users_cache[row.username] = row.id;
    });
    pg_query.on('end', function(result) {
      log.info("users loaded", result.rowCount);
    });
    pg_client.on('drain', pg_client.end.bind(pg_client));
    log.info("loading mycard user...");
    pg_client.connect();
    if (settings.modules.arena_mode.enabled && settings.modules.arena_mode.init_post.enabled) {
      request.post({
        url: settings.modules.arena_mode.init_post.url,
        qs: {
          ak: settings.modules.arena_mode.init_post.accesskey,
          arena: settings.modules.arena_mode.mode
        }
      }, (error, response, body) => {
        if (error) {
          log.warn('ARENA INIT POST ERROR', error);
        } else {
          if (response.statusCode >= 400) {
            log.warn('ARENA INIT POST FAIL', response.statusCode, response.statusMessage, body);
          }
        }
      });
    }
  }

  //else
  //  log.info 'ARENA INIT POST OK', response.statusCode, response.statusMessage
  if (settings.modules.challonge.enabled) {
    challonge_module_name = 'challonge';
    if (settings.modules.challonge.use_custom_module) {
      challonge_module_name = settings.modules.challonge.use_custom_module;
    }
    challonge = global.challonge = require(challonge_module_name).createClient(settings.modules.challonge.options);
    if (settings.modules.challonge.cache_ttl) {
      challonge_cache = [];
    }
    challonge_queue_callbacks = [[], []];
    is_requesting = [null, null];
    get_callback = function(challonge_type, _callback) {
      return (function(err, data) {
        var cur_callback;
        if (settings.modules.challonge.cache_ttl && !err && data) {
          challonge_cache[challonge_type] = data;
        }
        is_requesting[challonge_type] = null;
        _callback(err, data);
        while (challonge_queue_callbacks[challonge_type].length) {
          cur_callback = challonge_queue_callbacks[challonge_type].splice(0, 1)[0];
          cur_callback(err, data);
        }
      });
    };
    challonge.participants._index = function(_data) {
      var err;
      if (settings.modules.challonge.cache_ttl && challonge_cache[0]) {
        _data.callback(null, challonge_cache[0]);
      } else if (is_requesting[0] && moment() - is_requesting[0] <= 5000) {
        challonge_queue_callbacks[0].push(_data.callback);
      } else {
        _data.callback = get_callback(0, _data.callback);
        is_requesting[0] = moment();
        try {
          challonge.participants.index(_data);
        } catch (error1) {
          err = error1;
          _data.callback(err, null);
        }
      }
    };
    challonge.matches._index = function(_data) {
      var err;
      if (settings.modules.challonge.cache_ttl && challonge_cache[1]) {
        _data.callback(null, challonge_cache[1]);
      } else if (is_requesting[1] && moment() - is_requesting[1] <= 5000) {
        challonge_queue_callbacks[1].push(_data.callback);
      } else {
        _data.callback = get_callback(1, _data.callback);
        is_requesting[1] = moment();
        try {
          challonge.matches.index(_data);
        } catch (error1) {
          err = error1;
          _data.callback(err, null);
        }
      }
    };
    challonge.matches._update = function(_data) {
      var err;
      try {
        challonge.matches.update(_data);
      } catch (error1) {
        err = error1;
        log.warn("Errored pushing scores to Challonge.", err);
      }
    };
    refresh_challonge_cache = global.refresh_challonge_cache = function() {
      if (settings.modules.challonge.cache_ttl) {
        challonge_cache[0] = null;
        challonge_cache[1] = null;
      }
    };
    refresh_challonge_cache();
    // challonge.participants._index({
    //   id: settings.modules.challonge.tournament_id,
    //   callback: (() ->
    //     challonge.matches._index({
    //       id: settings.modules.challonge.tournament_id,
    //       callback: (() ->
    //         return
    //       )
    //     })
    //     return
    //   )
    // })
    if (settings.modules.challonge.cache_ttl) {
      setInterval(refresh_challonge_cache, settings.modules.challonge.cache_ttl);
    }
  }

  if (settings.modules.vip.enabled) {
    ref2 = vip_info.cdkeys;
    for (k in ref2) {
      v = ref2[k];
      if (v.length === 0) {
        VIP_generate_cdkeys(k, settings.modules.vip.generate_count);
      }
    }
  }

  // 获取可用内存
  memory_usage = global.memory_usage = 0;

  get_memory_usage = get_memory_usage = function() {
    var prc_free;
    prc_free = exec("free");
    prc_free.stdout.on('data', function(data) {
      var actualFree, buffers, cached, free, line, lines, new_free, percentUsed, total;
      lines = data.toString().split(/\n/g);
      line = lines[0].split(/\s+/);
      new_free = line[6] === 'available' ? true : false;
      line = lines[1].split(/\s+/);
      total = parseInt(line[1], 10);
      free = parseInt(line[3], 10);
      buffers = parseInt(line[5], 10);
      if (new_free) {
        actualFree = parseInt(line[6], 10);
      } else {
        cached = parseInt(line[6], 10);
        actualFree = free + buffers + cached;
      }
      percentUsed = parseFloat(((1 - (actualFree / total)) * 100).toFixed(2));
      memory_usage = global.memory_usage = percentUsed;
    });
  };

  get_memory_usage();

  setInterval(get_memory_usage, 3000);

  Cloud_replay_ids = global.Cloud_replay_ids = [];

  ROOM_all = global.ROOM_all = [];

  ROOM_players_oppentlist = global.ROOM_players_oppentlist = {};

  ROOM_players_banned = global.ROOM_players_banned = [];

  ROOM_players_scores = global.ROOM_players_scores = {};

  ROOM_connected_ip = global.ROOM_connected_ip = {};

  ROOM_bad_ip = global.ROOM_bad_ip = {};

  // ban a user manually and permanently
  ban_user = global.ban_user = function(name) {
    var bad_ip, len4, len5, o, p, player, ref3, room;
    settings.ban.banned_user.push(name);
    setting_save(settings);
    bad_ip = 0;
    for (o = 0, len4 = ROOM_all.length; o < len4; o++) {
      room = ROOM_all[o];
      if (room && room.established) {
        ref3 = room.players;
        for (p = 0, len5 = ref3.length; p < len5; p++) {
          player = ref3[p];
          if (player && (player.name === name || player.ip === bad_ip)) {
            bad_ip = player.ip;
            ROOM_bad_ip[bad_ip] = 99;
            settings.ban.banned_ip.push(player.ip);
            ygopro.stoc_send_chat_to_room(room, `${player.name} \${kicked_by_system}`, ygopro.constants.COLORS.RED);
            CLIENT_send_replays(player, room);
            CLIENT_kick(player);
            continue;
          }
        }
      }
    }
  };

  // automatically ban user to use random duel
  ROOM_ban_player = global.ROOM_ban_player = function(name, ip, reason, countadd = 1) {
    var bannedplayer, bantime;
    if (settings.modules.test_mode.no_ban_player) {
      return;
    }
    bannedplayer = _.find(ROOM_players_banned, function(bannedplayer) {
      return ip === bannedplayer.ip;
    });
    if (bannedplayer) {
      bannedplayer.count = bannedplayer.count + countadd;
      bantime = bannedplayer.count > 3 ? Math.pow(2, bannedplayer.count - 3) * 2 : 0;
      bannedplayer.time = moment() < bannedplayer.time ? moment(bannedplayer.time).add(bantime, 'm') : moment().add(bantime, 'm');
      if (!_.find(bannedplayer.reasons, function(bannedreason) {
        return bannedreason === reason;
      })) {
        bannedplayer.reasons.push(reason);
      }
      bannedplayer.need_tip = true;
    } else {
      bannedplayer = {
        "ip": ip,
        "time": moment(),
        "count": countadd,
        "reasons": [reason],
        "need_tip": true
      };
      ROOM_players_banned.push(bannedplayer);
    }
  };

  //log.info("banned", name, ip, reason, bannedplayer.count)
  ROOM_player_win = global.ROOM_player_win = function(name) {
    if (!ROOM_players_scores[name]) {
      ROOM_players_scores[name] = {
        win: 0,
        lose: 0,
        flee: 0,
        combo: 0
      };
    }
    ROOM_players_scores[name].win = ROOM_players_scores[name].win + 1;
    ROOM_players_scores[name].combo = ROOM_players_scores[name].combo + 1;
  };

  ROOM_player_lose = global.ROOM_player_lose = function(name) {
    if (!ROOM_players_scores[name]) {
      ROOM_players_scores[name] = {
        win: 0,
        lose: 0,
        flee: 0,
        combo: 0
      };
    }
    ROOM_players_scores[name].lose = ROOM_players_scores[name].lose + 1;
    ROOM_players_scores[name].combo = 0;
  };

  ROOM_player_flee = global.ROOM_player_flee = function(name) {
    if (!ROOM_players_scores[name]) {
      ROOM_players_scores[name] = {
        win: 0,
        lose: 0,
        flee: 0,
        combo: 0
      };
    }
    ROOM_players_scores[name].flee = ROOM_players_scores[name].flee + 1;
    ROOM_players_scores[name].combo = 0;
  };

  ROOM_player_get_score = global.ROOM_player_get_score = function(player) {
    var name, score, total;
    name = player.name_vpass;
    score = ROOM_players_scores[name];
    if (!score) {
      return `${player.name} \${random_score_blank}`;
    }
    total = score.win + score.lose;
    if (score.win < 2 && total < 3) {
      return `${player.name} \${random_score_not_enough}`;
    }
    if (score.combo >= 2) {
      return `\${random_score_part1}${player.name} \${random_score_part2} ${Math.ceil(score.win / total * 100)}\${random_score_part3} ${Math.ceil(score.flee / total * 100)}\${random_score_part4_combo}${score.combo}\${random_score_part5_combo}`;
    } else {
      //return player.name + " 的今日战绩：胜率" + Math.ceil(score.win/total*100) + "%，逃跑率" + Math.ceil(score.flee/total*100) + "%，" + score.combo + "连胜中！"
      return `\${random_score_part1}${player.name} \${random_score_part2} ${Math.ceil(score.win / total * 100)}\${random_score_part3} ${Math.ceil(score.flee / total * 100)}\${random_score_part4}`;
    }
  };

  if (settings.modules.random_duel.post_match_scores) {
    setInterval(function() {
      var scores, scores_by_lose, scores_by_win, scores_pair;
      scores_pair = _.pairs(ROOM_players_scores);
      scores_by_lose = _.sortBy(scores_pair, function(score) {
        return score[1].lose;
      }).reverse(); // 败场由高到低
      scores_by_win = _.sortBy(scores_by_lose, function(score) {
        return score[1].win;
      }).reverse(); // 然后胜场由低到高，再逆转，就是先排胜场再排败场
      scores = _.first(scores_by_win, 10);
      //log.info scores
      request.post({
        url: settings.modules.random_duel.post_match_scores,
        form: {
          accesskey: settings.modules.random_duel.post_match_accesskey,
          rank: JSON.stringify(scores)
        }
      }, (error, response, body) => {
        if (error) {
          log.warn('RANDOM SCORE POST ERROR', error);
        } else {
          if (response.statusCode !== 204 && response.statusCode !== 200) {
            log.warn('RANDOM SCORE POST FAIL', response.statusCode, response.statusMessage, body);
          }
        }
      });
    //else
    //  log.info 'RANDOM SCORE POST OK', response.statusCode, response.statusMessage
    }, 60000);
  }

  ROOM_find_or_create_by_name = global.ROOM_find_or_create_by_name = function(name, player_ip) {
    var room, uname;
    uname = name.toUpperCase();
    if (settings.modules.windbot.enabled && (uname.slice(0, 2) === 'AI' || (!settings.modules.random_duel.enabled && uname === ''))) {
      return ROOM_find_or_create_ai(name);
    }
    if (settings.modules.random_duel.enabled && (uname === '' || uname === 'S' || uname === 'M' || uname === 'T')) {
      return ROOM_find_or_create_random(uname, player_ip);
    }
    if (room = ROOM_find_by_name(name)) {
      return room;
    } else if (memory_usage >= 90) {
      return null;
    } else {
      return new Room(name);
    }
  };

  ROOM_find_or_create_random = global.ROOM_find_or_create_random = function(type, player_ip) {
    var bannedplayer, max_player, name, playerbanned;
    bannedplayer = _.find(ROOM_players_banned, function(bannedplayer) {
      return player_ip === bannedplayer.ip;
    });
    if (bannedplayer) {
      if (bannedplayer.count > 6 && moment() < bannedplayer.time) {
        return {
          "error": `\${random_banned_part1}${bannedplayer.reasons.join('${random_ban_reason_separator}')}\${random_banned_part2}${moment(bannedplayer.time).fromNow(true)}\${random_banned_part3}`
        };
      }
      if (bannedplayer.count > 3 && moment() < bannedplayer.time && bannedplayer.need_tip && type !== 'T') {
        bannedplayer.need_tip = false;
        return {
          "error": `\${random_deprecated_part1}${bannedplayer.reasons.join('${random_ban_reason_separator}')}\${random_deprecated_part2}${moment(bannedplayer.time).fromNow(true)}\${random_deprecated_part3}`
        };
      } else if (bannedplayer.need_tip) {
        bannedplayer.need_tip = false;
        return {
          "error": `\${random_warn_part1}${bannedplayer.reasons.join('${random_ban_reason_separator}')}\${random_warn_part2}`
        };
      } else if (bannedplayer.count > 2) {
        bannedplayer.need_tip = true;
      }
    }
    max_player = type === 'T' ? 4 : 2;
    playerbanned = bannedplayer && bannedplayer.count > 3 && moment() < bannedplayer.time;
    result = _.find(ROOM_all, function(room) {
      return room && room.random_type !== '' && room.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN && !room.windbot && ((type === '' && (room.random_type === 'S' || (settings.modules.random_duel.blank_pass_match && room.random_type !== 'T'))) || room.random_type === type) && room.get_playing_player().length < max_player && (settings.modules.random_duel.no_rematch_check || room.get_host() === null || room.get_host().ip !== ROOM_players_oppentlist[player_ip]) && (playerbanned === room.deprecated || type === 'T');
    });
    if (result) {
      result.welcome = '${random_duel_enter_room_waiting}';
    //log.info 'found room', player_name
    } else if (memory_usage < 90) {
      type = type ? type : 'S';
      name = type + ',RANDOM#' + Math.floor(Math.random() * 100000);
      result = new Room(name);
      result.random_type = type;
      result.max_player = max_player;
      result.welcome = '${random_duel_enter_room_new}';
      result.deprecated = playerbanned;
    } else {
      //log.info 'create room', player_name, name
      return null;
    }
    if (result.random_type === 'M') {
      result.welcome = result.welcome + '\n${random_duel_enter_room_match}';
    }
    return result;
  };

  ROOM_find_or_create_ai = global.ROOM_find_or_create_ai = function(name) {
    var ainame, namea, room, uname, windbot;
    if (name === '') {
      name = 'AI';
    }
    namea = name.split('#');
    uname = name.toUpperCase();
    if (room = ROOM_find_by_name(name)) {
      return room;
    } else if (uname === 'AI') {
      windbot = _.sample(windbots);
      name = 'AI#' + Math.floor(Math.random() * 100000);
    } else if (namea.length > 1) {
      ainame = namea[namea.length - 1];
      windbot = _.sample(_.filter(windbots, function(w) {
        return w.name === ainame || w.deck === ainame;
      }));
      if (!windbot) {
        return {
          "error": "${windbot_deck_not_found}"
        };
      }
      name = name + ',' + Math.floor(Math.random() * 100000);
    } else {
      windbot = _.sample(windbots);
      name = name + '#' + Math.floor(Math.random() * 100000);
    }
    if (name.replace(/[^\x00-\xff]/g, "00").length > 20) {
      log.info("long ai name", name);
      return {
        "error": "${windbot_name_too_long}"
      };
    }
    result = new Room(name);
    result.windbot = windbot;
    result.private = true;
    return result;
  };

  ROOM_find_by_name = global.ROOM_find_by_name = function(name) {
    result = _.find(ROOM_all, function(room) {
      return room && room.name === name;
    });
    return result;
  };

  ROOM_find_by_title = global.ROOM_find_by_title = function(title) {
    result = _.find(ROOM_all, function(room) {
      return room && room.title === title;
    });
    return result;
  };

  ROOM_find_by_port = global.ROOM_find_by_port = function(port) {
    return _.find(ROOM_all, function(room) {
      return room && room.port === port;
    });
  };

  ROOM_find_by_pid = global.ROOM_find_by_pid = function(pid) {
    return _.find(ROOM_all, function(room) {
      return room && room.process_pid === pid;
    });
  };

  ROOM_validate = global.ROOM_validate = function(name) {
    var client_name, client_name_and_pass, client_pass;
    client_name_and_pass = name.split('$', 2);
    client_name = client_name_and_pass[0];
    client_pass = client_name_and_pass[1];
    if (!client_pass) {
      return true;
    }
    return !_.find(ROOM_all, function(room) {
      var room_name, room_name_and_pass, room_pass;
      if (!room) {
        return false;
      }
      room_name_and_pass = room.name.split('$', 2);
      room_name = room_name_and_pass[0];
      room_pass = room_name_and_pass[1];
      return client_name === room_name && client_pass !== room_pass;
    });
  };

  ROOM_unwelcome = global.ROOM_unwelcome = function(room, bad_player, reason) {
    var len4, o, player, ref3;
    if (!room) {
      return;
    }
    ref3 = room.players;
    for (o = 0, len4 = ref3.length; o < len4; o++) {
      player = ref3[o];
      if (player && player === bad_player) {
        ygopro.stoc_send_chat(player, `\${unwelcome_warn_part1}${reason}\${unwelcome_warn_part2}`, ygopro.constants.COLORS.RED);
      } else if (player && player.pos !== 7 && player !== bad_player) {
        player.flee_free = true;
        ygopro.stoc_send_chat(player, `\${unwelcome_tip_part1}${reason}\${unwelcome_tip_part2}`, ygopro.constants.COLORS.BABYBLUE);
      }
    }
  };

  CLIENT_kick = global.CLIENT_kick = function(client) {
    if (!client) {
      return false;
    }
    client.system_kicked = true;
    if (settings.modules.reconnect.enabled && client.closed) {
      if (client.server && !client.had_new_reconnection) {
        client.server.destroy();
      }
    } else {
      client.destroy();
    }
    return true;
  };

  release_disconnect = global.release_disconnect = function(dinfo, reconnected) {
    if (dinfo.old_client && !reconnected) {
      dinfo.old_client.destroy();
    }
    if (dinfo.old_server && !reconnected) {
      dinfo.old_server.destroy();
    }
    clearTimeout(dinfo.timeout);
  };

  CLIENT_get_authorize_key = global.CLIENT_get_authorize_key = function(client) {
    if (!settings.modules.mycard.enabled && client.vpass) {
      return client.name_vpass;
    } else if (settings.modules.mycard.enabled || settings.modules.tournament_mode.enabled || settings.modules.challonge.enabled || client.is_local) {
      return client.name;
    } else {
      return client.ip + ":" + client.name;
    }
  };

  CLIENT_reconnect_unregister = global.CLIENT_reconnect_unregister = function(client, reconnected, exact) {
    if (!settings.modules.reconnect.enabled) {
      return false;
    }
    if (disconnect_list[CLIENT_get_authorize_key(client)]) {
      if (exact && disconnect_list[CLIENT_get_authorize_key(client)].old_client !== client) {
        return false;
      }
      release_disconnect(disconnect_list[CLIENT_get_authorize_key(client)], reconnected);
      delete disconnect_list[CLIENT_get_authorize_key(client)];
      return true;
    }
    return false;
  };

  CLIENT_reconnect_register = global.CLIENT_reconnect_register = function(client, room_id, error) {
    var dinfo, room, tmot;
    room = ROOM_all[room_id];
    if (client.had_new_reconnection) {
      return false;
    }
    if (!settings.modules.reconnect.enabled || !room || client.system_kicked || client.flee_free || disconnect_list[CLIENT_get_authorize_key(client)] || client.is_post_watcher || !CLIENT_is_player(client, room) || room.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN || room.windbot || (settings.modules.reconnect.auto_surrender_after_disconnect && room.hostinfo.mode !== 1) || (room.random_type && room.get_disconnected_count() > 1)) {
      return false;
    }
    // for player in room.players
    //   if player != client and CLIENT_get_authorize_key(player) == CLIENT_get_authorize_key(client)
    //     return false # some issues may occur in this case, so return false
    dinfo = {
      room_id: room_id,
      old_client: client,
      old_server: client.server,
      deckbuf: client.start_deckbuf
    };
    tmot = setTimeout(function() {
      room.disconnect(client, error);
      dinfo.old_server.destroy();
    }, settings.modules.reconnect.wait_time);
    dinfo.timeout = tmot;
    disconnect_list[CLIENT_get_authorize_key(client)] = dinfo;
    //console.log("#{client.name} ${disconnect_from_game}")
    ygopro.stoc_send_chat_to_room(room, `${client.name} \${disconnect_from_game}` + (error ? `: ${error}` : ''));
    if (client.time_confirm_required) {
      client.time_confirm_required = false;
      ygopro.ctos_send(client.server, 'TIME_CONFIRM');
    }
    if (settings.modules.reconnect.auto_surrender_after_disconnect && room.duel_stage === ygopro.constants.DUEL_STAGE.DUELING) {
      ygopro.ctos_send(client.server, 'SURRENDER');
    }
    return true;
  };

  CLIENT_import_data = global.CLIENT_import_data = function(client, old_client, room) {
    var index, key, len4, len5, o, p, player, ref3;
    ref3 = room.players;
    for (index = o = 0, len4 = ref3.length; o < len4; index = ++o) {
      player = ref3[index];
      if (player === old_client) {
        room.players[index] = client;
        break;
      }
    }
    room.dueling_players[old_client.pos] = client;
    if (room.waiting_for_player === old_client) {
      room.waiting_for_player = client;
    }
    if (room.waiting_for_player2 === old_client) {
      room.waiting_for_player2 = client;
    }
    if (room.selecting_tp === old_client) {
      room.selecting_tp = client;
    }
    for (p = 0, len5 = import_datas.length; p < len5; p++) {
      key = import_datas[p];
      client[key] = old_client[key];
    }
    old_client.had_new_reconnection = true;
  };

  SERVER_clear_disconnect = global.SERVER_clear_disconnect = function(server) {
    if (!settings.modules.reconnect.enabled) {
      return false;
    }
    for (k in disconnect_list) {
      v = disconnect_list[k];
      if (v && server === v.old_server) {
        release_disconnect(v);
        delete disconnect_list[k];
        return true;
      }
    }
    return false;
  };

  ROOM_clear_disconnect = global.ROOM_clear_disconnect = function(room_id) {
    if (!settings.modules.reconnect.enabled) {
      return false;
    }
    for (k in disconnect_list) {
      v = disconnect_list[k];
      if (v && room_id === v.room_id) {
        release_disconnect(v);
        delete disconnect_list[k];
        return true;
      }
    }
    return false;
  };

  CLIENT_is_player = global.CLIENT_is_player = function(client, room) {
    var is_player, len4, o, player, ref3;
    is_player = false;
    ref3 = room.players;
    for (o = 0, len4 = ref3.length; o < len4; o++) {
      player = ref3[o];
      if (client === player) {
        is_player = true;
        break;
      }
    }
    return is_player && client.pos <= 3;
  };

  CLIENT_is_able_to_reconnect = global.CLIENT_is_able_to_reconnect = function(client, deckbuf) {
    var disconnect_info, room;
    if (!settings.modules.reconnect.enabled) {
      return false;
    }
    if (client.system_kicked) {
      return false;
    }
    disconnect_info = disconnect_list[CLIENT_get_authorize_key(client)];
    if (!disconnect_info) {
      return false;
    }
    room = ROOM_all[disconnect_info.room_id];
    if (!room) {
      CLIENT_reconnect_unregister(client);
      return false;
    }
    if (deckbuf && !_.isEqual(deckbuf, disconnect_info.deckbuf)) {
      return false;
    }
    return true;
  };

  CLIENT_get_kick_reconnect_target = global.CLIENT_get_kick_reconnect_target = function(client, deckbuf) {
    var len4, len5, o, p, player, ref3, room;
    for (o = 0, len4 = ROOM_all.length; o < len4; o++) {
      room = ROOM_all[o];
      if (room && room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN && !room.windbot) {
        ref3 = room.get_playing_player();
        for (p = 0, len5 = ref3.length; p < len5; p++) {
          player = ref3[p];
          if (!player.closed && player.name === client.name && (settings.modules.challonge.enabled || player.pass === client.pass) && (settings.modules.mycard.enabled || settings.modules.tournament_mode.enabled || player.ip === client.ip || (client.vpass && client.vpass === player.vpass)) && (!deckbuf || _.isEqual(player.start_deckbuf, deckbuf))) {
            return player;
          }
        }
      }
    }
    return null;
  };

  CLIENT_is_able_to_kick_reconnect = global.CLIENT_is_able_to_kick_reconnect = function(client, deckbuf) {
    if (!(settings.modules.reconnect.enabled && settings.modules.reconnect.allow_kick_reconnect)) {
      return false;
    }
    if (!CLIENT_get_kick_reconnect_target(client, deckbuf)) {
      return false;
    }
    return true;
  };

  CLIENT_send_pre_reconnect_info = global.CLIENT_send_pre_reconnect_info = function(client, room, old_client) {
    var len4, o, player, ref3, req_pos;
    ygopro.stoc_send_chat(client, "${pre_reconnecting_to_room}", ygopro.constants.COLORS.BABYBLUE);
    ygopro.stoc_send(client, 'JOIN_GAME', room.join_game_buffer);
    req_pos = old_client.pos;
    if (old_client.is_host) {
      req_pos += 0x10;
    }
    ygopro.stoc_send(client, 'TYPE_CHANGE', {
      type: req_pos
    });
    ref3 = room.players;
    for (o = 0, len4 = ref3.length; o < len4; o++) {
      player = ref3[o];
      ygopro.stoc_send(client, 'HS_PLAYER_ENTER', {
        name: player.name,
        pos: player.pos
      });
    }
  };

  CLIENT_send_reconnect_info = global.CLIENT_send_reconnect_info = function(client, server, room) {
    client.reconnecting = true;
    ygopro.stoc_send_chat(client, "${reconnecting_to_room}", ygopro.constants.COLORS.BABYBLUE);
    switch (room.duel_stage) {
      case ygopro.constants.DUEL_STAGE.FINGER:
        ygopro.stoc_send(client, 'DUEL_START');
        if ((room.hostinfo.mode !== 2 || client.pos === 0 || client.pos === 2) && !client.selected_preduel) {
          ygopro.stoc_send(client, 'SELECT_HAND');
        }
        client.reconnecting = false;
        break;
      case ygopro.constants.DUEL_STAGE.FIRSTGO:
        ygopro.stoc_send(client, 'DUEL_START');
        if (client === room.selecting_tp) { // and !client.selected_preduel
          ygopro.stoc_send(client, 'SELECT_TP');
        }
        client.reconnecting = false;
        break;
      case ygopro.constants.DUEL_STAGE.SIDING:
        ygopro.stoc_send(client, 'DUEL_START');
        if (!client.selected_preduel) {
          ygopro.stoc_send(client, 'CHANGE_SIDE');
        }
        client.reconnecting = false;
        break;
      default:
        ygopro.ctos_send(server, 'REQUEST_FIELD');
        break;
    }
  };

  CLIENT_pre_reconnect = global.CLIENT_pre_reconnect = function(client) {
    var dinfo, player;
    if (CLIENT_is_able_to_reconnect(client)) {
      dinfo = disconnect_list[CLIENT_get_authorize_key(client)];
      client.pre_reconnecting = true;
      client.pos = dinfo.old_client.pos;
      client.setTimeout(300000);
      CLIENT_send_pre_reconnect_info(client, ROOM_all[dinfo.room_id], dinfo.old_client);
    } else if (CLIENT_is_able_to_kick_reconnect(client)) {
      player = CLIENT_get_kick_reconnect_target(client);
      client.pre_reconnecting = true;
      client.pos = player.pos;
      client.setTimeout(300000);
      CLIENT_send_pre_reconnect_info(client, ROOM_all[player.rid], player);
    }
  };

  CLIENT_reconnect = global.CLIENT_reconnect = function(client) {
    var current_old_server, dinfo, room;
    if (!CLIENT_is_able_to_reconnect(client)) {
      ygopro.stoc_send_chat(client, "${reconnect_failed}", ygopro.constants.COLORS.RED);
      CLIENT_kick(client);
      return;
    }
    client.pre_reconnecting = false;
    dinfo = disconnect_list[CLIENT_get_authorize_key(client)];
    room = ROOM_all[dinfo.room_id];
    current_old_server = client.server;
    client.server = dinfo.old_server;
    client.server.client = client;
    dinfo.old_client.server = null;
    current_old_server.client = null;
    current_old_server.had_new_reconnection = true;
    current_old_server.destroy();
    client.established = true;
    client.pre_establish_buffers = [];
    if (room.random_type || room.arena) {
      room.last_active_time = moment();
    }
    CLIENT_import_data(client, dinfo.old_client, room);
    CLIENT_send_reconnect_info(client, client.server, room);
    //console.log("#{client.name} ${reconnect_to_game}")
    ygopro.stoc_send_chat_to_room(room, `${client.name} \${reconnect_to_game}`);
    CLIENT_reconnect_unregister(client, true);
  };

  CLIENT_kick_reconnect = global.CLIENT_kick_reconnect = function(client, deckbuf) {
    var current_old_server, player, room;
    if (!CLIENT_is_able_to_kick_reconnect(client)) {
      ygopro.stoc_send_chat(client, "${reconnect_failed}", ygopro.constants.COLORS.RED);
      CLIENT_kick(client);
      return;
    }
    client.pre_reconnecting = false;
    player = CLIENT_get_kick_reconnect_target(client, deckbuf);
    room = ROOM_all[player.rid];
    current_old_server = client.server;
    client.server = player.server;
    client.server.client = client;
    ygopro.stoc_send_chat(player, "${reconnect_kicked}", ygopro.constants.COLORS.RED);
    player.server = null;
    player.had_new_reconnection = true;
    CLIENT_kick(player);
    current_old_server.client = null;
    current_old_server.had_new_reconnection = true;
    current_old_server.destroy();
    client.established = true;
    client.pre_establish_buffers = [];
    if (room.random_type || room.arena) {
      room.last_active_time = moment();
    }
    CLIENT_import_data(client, player, room);
    CLIENT_send_reconnect_info(client, client.server, room);
    //console.log("#{client.name} ${reconnect_to_game}")
    ygopro.stoc_send_chat_to_room(room, `${client.name} \${reconnect_to_game}`);
    CLIENT_reconnect_unregister(client, true);
  };

  if (settings.modules.reconnect.enabled) {
    disconnect_list = {}; // {old_client, old_server, room_id, timeout, deckbuf}
  }

  CLIENT_heartbeat_unregister = global.CLIENT_heartbeat_unregister = function(client) {
    if (!settings.modules.heartbeat_detection.enabled || !client.heartbeat_timeout) {
      return false;
    }
    clearTimeout(client.heartbeat_timeout);
    delete client.heartbeat_timeout;
    //log.info(2, client.name)
    return true;
  };

  CLIENT_heartbeat_register = global.CLIENT_heartbeat_register = function(client, send) {
    if (!settings.modules.heartbeat_detection.enabled || client.closed || client.is_post_watcher || client.pre_reconnecting || client.reconnecting || client.waiting_for_last || client.pos > 3 || client.heartbeat_protected) {
      return false;
    }
    if (client.heartbeat_timeout) {
      CLIENT_heartbeat_unregister(client);
    }
    client.heartbeat_responsed = false;
    if (send) {
      ygopro.stoc_send(client, "TIME_LIMIT", {
        player: 0,
        left_time: 0
      });
      ygopro.stoc_send(client, "TIME_LIMIT", {
        player: 1,
        left_time: 0
      });
    }
    client.heartbeat_timeout = setTimeout(function() {
      CLIENT_heartbeat_unregister(client);
      if (!(client.closed || client.heartbeat_responsed)) {
        client.destroy();
      }
    }, settings.modules.heartbeat_detection.wait_time);
    //log.info(1, client.name)
    return true;
  };

  CLIENT_is_banned_by_mc = global.CLIENT_is_banned_by_mc = function(client) {
    return client.ban_mc && client.ban_mc.banned && moment().isBefore(client.ban_mc.until);
  };

  CLIENT_get_absolute_pos = global.CLIENT_get_absolute_pos = function(client) {
    var room;
    room = ROOM_all[client.rid];
    if (room.hostinfo.mode !== 2 || client.pos > 3) {
      return client.pos;
    } else if (client.pos < 2) {
      return 0;
    } else {
      return 1;
    }
  };

  CLIENT_get_partner = global.CLIENT_get_partner = function(client) {
    var room;
    room = ROOM_all[client.rid];
    if (room.hostinfo.mode !== 2 || client.pos > 3) {
      return client;
    }
    if (client.pos < 2) {
      return room.dueling_players[1 - client.pos];
    } else {
      return room.dueling_players[5 - client.pos];
    }
  };

  CLIENT_send_replays = global.CLIENT_send_replays = function(client, room) {
    var buffer, i, len4, o, ref3;
    if (!(settings.modules.replay_delay && !(settings.modules.tournament_mode.enabled && settings.modules.tournament_mode.replay_safe && settings.modules.tournament_mode.block_replay_to_player) && room.replays.length && room.hostinfo.mode === 1 && !client.replays_sent && !client.closed)) {
      return false;
    }
    client.replays_sent = true;
    i = 0;
    ref3 = room.replays;
    for (o = 0, len4 = ref3.length; o < len4; o++) {
      buffer = ref3[o];
      ++i;
      if (buffer) {
        ygopro.stoc_send_chat(client, "${replay_hint_part1}" + i + "${replay_hint_part2}", ygopro.constants.COLORS.BABYBLUE);
        ygopro.stoc_send(client, "REPLAY", buffer);
      }
    }
    return true;
  };

  SOCKET_flush_data = global.SOCKET_flush_data = function(sk, datas) {
    var buffer, len4, o;
    if (!sk || sk.closed) {
      return false;
    }
    for (o = 0, len4 = datas.length; o < len4; o++) {
      buffer = datas[o];
      sk.write(buffer);
    }
    datas.splice(0, datas.length);
    return true;
  };

  Room = class Room {
    constructor(name, hostinfo) {
      var death_time, draw_count, duel_rule, lflist, param, rule, start_hand, start_lp, time_limit;
      this.hostinfo = hostinfo;
      this.name = name;
      //@alive = true
      this.players = [];
      this.player_datas = [];
      this.status = 'starting';
      //@started = false
      this.established = false;
      this.watcher_buffers = [];
      this.recorder_buffers = [];
      this.cloud_replay_id = Math.floor(Math.random() * 90000000 + 10000000);
      this.watchers = [];
      this.random_type = '';
      this.welcome = '';
      this.scores = {};
      this.decks = {};
      this.duel_count = 0;
      this.death = 0;
      this.turn = 0;
      this.duel_stage = ygopro.constants.DUEL_STAGE.BEGIN;
      this.replays = [];
      this.first_list = [];
      ROOM_all.push(this);
      this.hostinfo || (this.hostinfo = JSON.parse(JSON.stringify(settings.hostinfo)));
      delete this.hostinfo.comment;
      if (lflists.length) {
        if (this.hostinfo.rule === 1 && this.hostinfo.lflist === 0) {
          this.hostinfo.lflist = _.findIndex(lflists, function(list) {
            return list.tcg;
          });
        }
      } else {
        this.hostinfo.lflist = -1;
      }
      if (name.slice(0, 2) === 'M#') {
        this.hostinfo.mode = 1;
      } else if (name.slice(0, 2) === 'T#') {
        this.hostinfo.mode = 2;
        this.hostinfo.start_lp = 16000;
      } else if (name.slice(0, 3) === 'AI#') {
        this.hostinfo.rule = 2;
        this.hostinfo.lflist = -1;
        this.hostinfo.time_limit = 0;
        this.hostinfo.no_check_deck = true;
      } else if ((param = name.match(/^(\d)(\d)(T|F)(T|F)(T|F)(\d+),(\d+),(\d+)/i))) {
        this.hostinfo.rule = parseInt(param[1]);
        this.hostinfo.mode = parseInt(param[2]);
        this.hostinfo.duel_rule = (param[3] === 'T' ? 3 : 4);
        this.hostinfo.no_check_deck = param[4] === 'T';
        this.hostinfo.no_shuffle_deck = param[5] === 'T';
        this.hostinfo.start_lp = parseInt(param[6]);
        this.hostinfo.start_hand = parseInt(param[7]);
        this.hostinfo.draw_count = parseInt(param[8]);
      } else if ((param = name.match(/(.+)#/)) !== null) {
        rule = param[1].toUpperCase();
        if (rule.match(/(^|，|,)(M|MATCH)(，|,|$)/)) {
          this.hostinfo.mode = 1;
        }
        if (rule.match(/(^|，|,)(T|TAG)(，|,|$)/)) {
          this.hostinfo.mode = 2;
          this.hostinfo.start_lp = 16000;
        }
        if (rule.match(/(^|，|,)(TCGONLY|TO)(，|,|$)/)) {
          this.hostinfo.rule = 1;
          this.hostinfo.lflist = _.findIndex(lflists, function(list) {
            return list.tcg;
          });
        }
        if (rule.match(/(^|，|,)(OCGONLY|OO)(，|,|$)/)) {
          this.hostinfo.rule = 0;
          this.hostinfo.lflist = 0;
        }
        if (rule.match(/(^|，|,)(OT|TCG)(，|,|$)/)) {
          this.hostinfo.rule = 2;
        }
        if ((param = rule.match(/(^|，|,)LP(\d+)(，|,|$)/))) {
          start_lp = parseInt(param[2]);
          if (start_lp <= 0) {
            start_lp = 1;
          }
          if (start_lp >= 99999) {
            start_lp = 99999;
          }
          this.hostinfo.start_lp = start_lp;
        }
        if ((param = rule.match(/(^|，|,)(TIME|TM|TI)(\d+)(，|,|$)/))) {
          time_limit = parseInt(param[3]);
          if (time_limit < 0) {
            time_limit = 180;
          }
          if (time_limit >= 1 && time_limit <= 60) {
            time_limit = time_limit * 60;
          }
          if (time_limit >= 999) {
            time_limit = 999;
          }
          this.hostinfo.time_limit = time_limit;
        }
        if ((param = rule.match(/(^|，|,)(START|ST)(\d+)(，|,|$)/))) {
          start_hand = parseInt(param[3]);
          if (start_hand <= 0) {
            start_hand = 1;
          }
          if (start_hand >= 40) {
            start_hand = 40;
          }
          this.hostinfo.start_hand = start_hand;
        }
        if ((param = rule.match(/(^|，|,)(DRAW|DR)(\d+)(，|,|$)/))) {
          draw_count = parseInt(param[3]);
          if (draw_count >= 35) {
            draw_count = 35;
          }
          this.hostinfo.draw_count = draw_count;
        }
        if ((param = rule.match(/(^|，|,)(LFLIST|LF)(\d+)(，|,|$)/))) {
          lflist = parseInt(param[3]) - 1;
          this.hostinfo.lflist = lflist;
        }
        if (rule.match(/(^|，|,)(NOLFLIST|NF)(，|,|$)/)) {
          this.hostinfo.lflist = -1;
        }
        if (rule.match(/(^|，|,)(NOUNIQUE|NU)(，|,|$)/)) {
          this.hostinfo.rule = 3;
        }
        if (rule.match(/(^|，|,)(NOCHECK|NC|DC)(，|,|$)/)) {
          this.hostinfo.no_check_deck = true;
        }
        if (rule.match(/(^|，|,)(NOSHUFFLE|NS)(，|,|$)/)) {
          this.hostinfo.no_shuffle_deck = true;
        }
        if (rule.match(/(^|，|,)(IGPRIORITY|PR)(，|,|$)/)) { // deprecated
          this.hostinfo.duel_rule = 3;
        }
        if ((param = rule.match(/(^|，|,)(DUELRULE|MR)(\d+)(，|,|$)/))) {
          duel_rule = parseInt(param[3]);
          if (duel_rule && duel_rule > 0 && duel_rule <= 5) {
            this.hostinfo.duel_rule = duel_rule;
          }
        }
        if (rule.match(/(^|，|,)(NOWATCH|NW)(，|,|$)/)) {
          this.hostinfo.no_watch = true;
        }
        if ((param = rule.match(/(^|，|,)(DEATH|DH)(\d*)(，|,|$)/))) {
          death_time = parseInt(param[3]);
          if (death_time && death_time > 0) {
            this.hostinfo.auto_death = death_time;
          } else {
            this.hostinfo.auto_death = 40;
          }
        }
      }
      this.hostinfo.replay_mode = 0; // 0x1: Save the replays in file. 0x2: Block the replays to observers.
      if (settings.modules.tournament_mode.enabled) {
        this.hostinfo.replay_mode |= 0x1;
      }
      if ((settings.modules.tournament_mode.enabled && settings.modules.tournament_mode.replay_safe) || (this.hostinfo.mode === 1 && settings.modules.replay_delay)) {
        this.hostinfo.replay_mode |= 0x2;
      }
      param = [0, this.hostinfo.lflist, this.hostinfo.rule, this.hostinfo.mode, this.hostinfo.duel_rule, (this.hostinfo.no_check_deck ? 'T' : 'F'), (this.hostinfo.no_shuffle_deck ? 'T' : 'F'), this.hostinfo.start_lp, this.hostinfo.start_hand, this.hostinfo.draw_count, this.hostinfo.time_limit, this.hostinfo.replay_mode];
      try {
        this.process = spawn('./ygopro', param, {
          cwd: 'ygopro'
        });
        this.process_pid = this.process.pid;
        this.process.on('error', (err) => {
          _.each(this.players, function(player) {
            return ygopro.stoc_die(player, "${create_room_failed}");
          });
          this.delete();
        });
        this.process.on('exit', (code) => {
          if (!this.disconnector) {
            this.disconnector = 'server';
          }
          this.delete();
        });
        this.process.stdout.setEncoding('utf8');
        this.process.stdout.once('data', (data) => {
          this.established = true;
          if (!this.windbot && settings.modules.http.websocket_roomlist) {
            roomlist.create(this);
          }
          this.port = parseInt(data);
          _.each(this.players, (player) => {
            player.server.connect(this.port, '127.0.0.1', function() {
              var buffer, len4, o, ref3;
              ref3 = player.pre_establish_buffers;
              for (o = 0, len4 = ref3.length; o < len4; o++) {
                buffer = ref3[o];
                player.server.write(buffer);
              }
              player.established = true;
              player.pre_establish_buffers = [];
            });
          });
          if (this.windbot) {
            setTimeout(() => {
              return this.add_windbot(this.windbot);
            }, 200);
          }
        });
        this.process.stderr.on('data', (data) => {
          data = "Debug: " + data;
          data = data.replace(/\n$/, "");
          log.info("YGOPRO " + data);
          ygopro.stoc_send_chat_to_room(this, data, ygopro.constants.COLORS.RED);
          this.has_ygopro_error = true;
          this.ygopro_error_length = this.ygopro_error_length ? this.ygopro_error_length + data.length : data.length;
          if (this.ygopro_error_length > 10000) {
            this.send_replays();
            this.process.kill();
          }
        });
      } catch (error1) {
        this.error = "${create_room_failed}";
      }
    }

    delete() {
      var end_time, formatted_replays, index, len4, log_rep_id, name, o, player_ips, player_names, recorder_buffer, ref3, ref4, repbuf, replay_id, room_name, score, score_array, score_form;
      if (this.deleted) {
        return;
      }
      //log.info 'room-delete', this.name, ROOM_all.length
      score_array = [];
      ref3 = this.scores;
      for (name in ref3) {
        score = ref3[name];
        score_form = {
          name: name.split('$')[0],
          score: score,
          deck: null,
          name_vpass: name
        };
        if (this.decks[name]) {
          score_form.deck = this.decks[name];
        }
        score_array.push(score_form);
      }
      if (settings.modules.random_duel.record_match_scores && this.random_type === 'M') {
        if (score_array.length === 2) {
          if (score_array[0].score !== score_array[1].score) {
            if (score_array[0].score > score_array[1].score) {
              ROOM_player_win(score_array[0].name_vpass);
              ROOM_player_lose(score_array[1].name_vpass);
            } else {
              ROOM_player_win(score_array[1].name_vpass);
              ROOM_player_lose(score_array[0].name_vpass);
            }
          }
        }
        if (score_array.length === 1) { // same name
          //log.info score_array[0].name
          ROOM_player_win(score_array[0].name_vpass);
          ROOM_player_lose(score_array[0].name_vpass);
        }
      }
      if (settings.modules.arena_mode.enabled && this.arena) {
        //log.info 'SCORE', score_array, @start_time
        end_time = moment().format();
        if (!this.start_time) {
          this.start_time = end_time;
        }
        if (score_array.length !== 2) {
          if (!score_array[0]) {
            score_array[0] = {
              name: null,
              score: -5,
              deck: null
            };
          }
          if (!score_array[1]) {
            score_array[1] = {
              name: null,
              score: -5,
              deck: null
            };
          }
          score_array[0].score = -5;
          score_array[1].score = -5;
        }
        formatted_replays = [];
        ref4 = this.replays;
        for (o = 0, len4 = ref4.length; o < len4; o++) {
          repbuf = ref4[o];
          if (repbuf) {
            formatted_replays.push(repbuf.toString("base64"));
          }
        }
        request.post({
          url: settings.modules.arena_mode.post_score,
          form: {
            accesskey: settings.modules.arena_mode.accesskey,
            usernameA: score_array[0].name,
            usernameB: score_array[1].name,
            userscoreA: score_array[0].score,
            userscoreB: score_array[1].score,
            userdeckA: score_array[0].deck,
            userdeckB: score_array[1].deck,
            first: JSON.stringify(this.first_list),
            replays: JSON.stringify(formatted_replays),
            start: this.start_time,
            end: end_time,
            arena: this.arena
          }
        }, (error, response, body) => {
          if (error) {
            log.warn('SCORE POST ERROR', error);
          } else {
            if (response.statusCode !== 204 && response.statusCode !== 200) {
              log.warn('SCORE POST FAIL', response.statusCode, response.statusMessage, this.name, body);
            }
          }
        });
      }
      //else
      //  log.info 'SCORE POST OK', response.statusCode, response.statusMessage, @name, body
      if (settings.modules.challonge.enabled && this.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN && this.hostinfo.mode !== 2 && !this.kicked) {
        room_name = this.name;
        challonge.matches._update({
          id: settings.modules.challonge.tournament_id,
          matchId: this.challonge_info.id,
          match: this.get_challonge_score(),
          callback: function(err, data) {
            if (err) {
              log.warn("Errored pushing scores to Challonge.", room_name, err);
            } else {
              refresh_challonge_cache();
            }
          }
        });
      }
      if (this.player_datas.length && settings.modules.cloud_replay.enabled) {
        replay_id = this.cloud_replay_id;
        if (this.has_ygopro_error) {
          log_rep_id = true;
        }
        player_names = this.player_datas[0].name + (this.player_datas[2] ? "+" + this.player_datas[2].name : "") + " VS " + (this.player_datas[1] ? this.player_datas[1].name : "AI") + (this.player_datas[3] ? "+" + this.player_datas[3].name : "");
        player_ips = [];
        _.each(this.player_datas, function(player) {
          player_ips.push(player.key);
        });
        recorder_buffer = Buffer.concat(this.recorder_buffers);
        zlib.deflate(recorder_buffer, function(err, replay_buffer) {
          var date_time, recorded_ip;
          //log.info err, replay_buffer
          date_time = moment().format('YYYY-MM-DD HH:mm:ss');
          //replay_id=Math.floor(Math.random()*100000000)
          if (settings.modules.cloud_replay.engine === 'redis') {
            replay_buffer = replay_buffer.toString('binary');
            redisdb.hmset("replay:" + replay_id, "replay_id", replay_id, "replay_buffer", replay_buffer, "player_names", player_names, "date_time", date_time);
            if (!log_rep_id && !settings.modules.cloud_replay.never_expire) {
              redisdb.expire("replay:" + replay_id, 60 * 60 * 24);
            }
            recorded_ip = [];
            _.each(player_ips, function(player_ip) {
              if (_.contains(recorded_ip, player_ip)) {
                return;
              }
              recorded_ip.push(player_ip);
              redisdb.lpush(player_ip + ":replays", replay_id);
            });
            if (log_rep_id) {
              log.info("error replay: R#" + replay_id);
            }
            return;
          } else if (settings.modules.cloud_replay.engine === 'mysql') {
            recorded_ip = [];
            _.each(player_ips, function(player_ip) {
              var sqlParams;
              if (_.contains(recorded_ip, player_ip)) {
                return;
              }
              recorded_ip.push(player_ip);
              sql = 'INSERT INTO CloudReplay(ip,replayId,replayBuffer,playerNames,saveDate) VALUES(?,?,?,?,?);';
              sqlParams = [player_ip, replay_id, replay_buffer, player_names, date_time];
              return mysqldb.query(sql, sqlParams, function(err, result) {
                if (err) {
                  log.info(err);
                }
              });
            });
          }
          if (log_rep_id) {
            log.info("error replay: R#" + replay_id);
          }
        });
      }
      this.watcher_buffers = [];
      this.recorder_buffers = [];
      this.players = [];
      if (this.watcher) {
        this.watcher.destroy();
      }
      if (this.recorder) {
        this.recorder.destroy();
      }
      this.deleted = true;
      index = _.indexOf(ROOM_all, this);
      if (settings.modules.reconnect.enabled) {
        ROOM_clear_disconnect(index);
      }
      if (index !== -1) {
        ROOM_all[index] = null;
      }
      if (!this.windbot && this.established && settings.modules.http.websocket_roomlist) {
        //ROOM_all.splice(index, 1) unless index == -1
        roomlist.delete(this);
      }
    }

    get_playing_player() {
      var playing_player;
      playing_player = [];
      _.each(this.players, function(player) {
        if (player.pos < 4) {
          playing_player.push(player);
        }
      });
      return playing_player;
    }

    get_host() {
      var host_player;
      host_player = null;
      _.each(this.players, function(player) {
        if (player.is_host) {
          host_player = player;
        }
      });
      return host_player;
    }

    get_disconnected_count() {
      var found, len4, o, player, ref3;
      if (!settings.modules.reconnect.enabled) {
        return 0;
      }
      found = 0;
      ref3 = this.get_playing_player();
      for (o = 0, len4 = ref3.length; o < len4; o++) {
        player = ref3[o];
        if (player.closed) {
          found++;
        }
      }
      return found;
    }

    get_challonge_score() {
      var challonge_duel_log;
      if (!settings.modules.challonge.enabled || this.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN || this.hostinfo.mode === 2) {
        return null;
      }
      challonge_duel_log = {};
      if (this.scores[this.dueling_players[0].name_vpass] > this.scores[this.dueling_players[1].name_vpass]) {
        challonge_duel_log.winnerId = this.dueling_players[0].challonge_info.id;
      } else if (this.scores[this.dueling_players[0].name_vpass] < this.scores[this.dueling_players[1].name_vpass]) {
        challonge_duel_log.winnerId = this.dueling_players[1].challonge_info.id;
      } else {
        challonge_duel_log.winnerId = "tie";
      }
      if (settings.modules.challonge.post_detailed_score) {
        if (this.dueling_players[0].challonge_info.id === this.challonge_info.player1Id && this.dueling_players[1].challonge_info.id === this.challonge_info.player2Id) {
          challonge_duel_log.scoresCsv = this.scores[this.dueling_players[0].name_vpass] + "-" + this.scores[this.dueling_players[1].name_vpass];
        } else if (this.dueling_players[1].challonge_info.id === this.challonge_info.player1Id && this.dueling_players[0].challonge_info.id === this.challonge_info.player2Id) {
          challonge_duel_log.scoresCsv = this.scores[this.dueling_players[1].name_vpass] + "-" + this.scores[this.dueling_players[0].name_vpass];
        } else {
          challonge_duel_log.scoresCsv = "0-0";
          log.warn("Score mismatch.", this.name);
        }
      } else {
        if (challonge_duel_log.winnerId === this.challonge_info.player1Id) {
          challonge_duel_log.scoresCsv = "1-0";
        } else if (challonge_duel_log.winnerId === this.challonge_info.player2Id) {
          challonge_duel_log.scoresCsv = "0-1";
        } else {
          challonge_duel_log.scoresCsv = "0-0";
        }
      }
      return challonge_duel_log;
    }

    get_old_hostinfo() { // Just for supporting websocket roomlist in old MyCard client....
      var ret;
      ret = _.clone(this.hostinfo);
      ret.enable_priority = this.hostinfo.duel_rule !== 4;
      return ret;
    }

    send_replays() {
      var len4, len5, o, p, player, ref3, ref4;
      if (!(settings.modules.replay_delay && this.replays.length && this.hostinfo.mode === 1)) {
        return false;
      }
      ref3 = this.players;
      for (o = 0, len4 = ref3.length; o < len4; o++) {
        player = ref3[o];
        CLIENT_send_replays(player, this);
      }
      ref4 = this.watchers;
      for (p = 0, len5 = ref4.length; p < len5; p++) {
        player = ref4[p];
        CLIENT_send_replays(player, this);
      }
      return true;
    }

    add_windbot(botdata) {
      this.windbot = botdata;
      request({
        url: `http://${settings.modules.windbot.server_ip}:${settings.modules.windbot.port}/?name=${encodeURIComponent(botdata.name)}&deck=${encodeURIComponent(botdata.deck)}&host=${settings.modules.windbot.my_ip}&port=${settings.port}&dialog=${encodeURIComponent(botdata.dialog)}&version=${settings.version}&password=${encodeURIComponent(this.name)}`
      }, (error, response, body) => {
        if (error) {
          log.warn('windbot add error', error, this.name);
          ygopro.stoc_send_chat_to_room(this, "${add_windbot_failed}", ygopro.constants.COLORS.RED);
        }
      });
    }

    //else
    //log.info "windbot added"
    connect(client) {
      var host_player;
      this.players.push(client);
      client.join_time = moment();
      if (this.random_type) {
        client.abuse_count = 0;
        host_player = this.get_host();
        if (host_player && (host_player !== client)) {
          // 进来时已经有人在等待了，互相记录为匹配过
          ROOM_players_oppentlist[host_player.ip] = client.ip;
          ROOM_players_oppentlist[client.ip] = host_player.ip;
        } else {
          // 第一个玩家刚进来，还没就位
          ROOM_players_oppentlist[client.ip] = null;
        }
      }
      if (this.established) {
        if (!this.windbot && this.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN && settings.modules.http.websocket_roomlist) {
          roomlist.update(this);
        }
        client.server.connect(this.port, '127.0.0.1', function() {
          var buffer, len4, o, ref3;
          ref3 = client.pre_establish_buffers;
          for (o = 0, len4 = ref3.length; o < len4; o++) {
            buffer = ref3[o];
            client.server.write(buffer);
          }
          client.established = true;
          client.pre_establish_buffers = [];
        });
      }
    }

    disconnect(client, error) {
      var index, left_name, len4, len5, o, p, player, ref3, ref4;
      if (client.had_new_reconnection) {
        return;
      }
      if (client.is_post_watcher) {
        ygopro.stoc_send_chat_to_room(this, `${client.name} \${quit_watch}` + (error ? `: ${error}` : ''));
        index = _.indexOf(this.watchers, client);
        if (index !== -1) {
          this.watchers.splice(index, 1);
        }
        //client.room = null
        client.server.destroy();
      } else {
        //log.info(client.name, @duel_stage != ygopro.constants.DUEL_STAGE.BEGIN, @disconnector, @random_type, @players.length)
        if (this.arena && this.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN && this.disconnector !== 'server' && !this.arena_score_handled) {
          if (settings.modules.arena_mode.punish_quit_before_match && this.players.length === 2 && !client.arena_quit_free) {
            ref3 = this.players;
            for (o = 0, len4 = ref3.length; o < len4; o++) {
              player = ref3[o];
              if (player.pos !== 7) {
                this.scores[player.name_vpass] = 0;
              }
            }
            this.scores[client.name_vpass] = -9;
          } else {
            ref4 = this.players;
            for (p = 0, len5 = ref4.length; p < len5; p++) {
              player = ref4[p];
              if (player.pos !== 7) {
                this.scores[player.name_vpass] = -5;
              }
            }
            if (this.players.length === 2) {
              this.scores[client.name_vpass] = -9;
            }
          }
          this.arena_score_handled = true;
        }
        index = _.indexOf(this.players, client);
        if (index !== -1) {
          this.players.splice(index, 1);
        }
        if (this.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN && this.disconnector !== 'server' && client.pos < 4) {
          this.finished = true;
          if (!this.finished_by_death) {
            this.scores[client.name_vpass] = -9;
            if (this.random_type && !client.flee_free && (!settings.modules.reconnect.enabled || this.get_disconnected_count() === 0)) {
              ROOM_ban_player(client.name, client.ip, "${random_ban_reason_flee}");
              if (settings.modules.random_duel.record_match_scores && this.random_type === 'M') {
                ROOM_player_flee(client.name_vpass);
              }
            }
          }
        }
        if (this.players.length && !(this.windbot && client.is_host) && !(this.arena && this.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN && client.pos <= 3)) {
          left_name = (settings.modules.hide_name && this.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN ? "********" : client.name);
          ygopro.stoc_send_chat_to_room(this, `${left_name} \${left_game}` + (error ? `: ${error}` : ''));
          if (!this.windbot && this.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN && settings.modules.http.websocket_roomlist) {
            roomlist.update(this);
          }
        } else {
          //client.room = null
          this.send_replays();
          this.process.kill();
          //client.room = null
          this.delete();
        }
        if (!CLIENT_reconnect_unregister(client, false, true)) {
          client.server.destroy();
        }
      }
    }

    start_death() {
      var oppo_pos, win_pos;
      if (this.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN || this.death) {
        return false;
      }
      oppo_pos = this.hostinfo.mode === 2 ? 2 : 1;
      if (this.duel_stage === ygopro.constants.DUEL_STAGE.DUELING) {
        switch (settings.modules.http.quick_death_rule) {
          case 3:
            this.death = -2;
            ygopro.stoc_send_chat_to_room(this, "${death_start_phase}", ygopro.constants.COLORS.BABYBLUE);
            break;
          default:
            this.death = (this.turn ? this.turn + 4 : 5);
            ygopro.stoc_send_chat_to_room(this, "${death_start}", ygopro.constants.COLORS.BABYBLUE); // Extra duel started in siding
        }
      } else {
        switch (settings.modules.http.quick_death_rule) {
          case 2:
          case 3:
            if (this.scores[this.dueling_players[0].name_vpass] === this.scores[this.dueling_players[oppo_pos].name_vpass]) {
              if (settings.modules.http.quick_death_rule === 3) {
                this.death = -1;
                ygopro.stoc_send_chat_to_room(this, "${death_start_quick}", ygopro.constants.COLORS.BABYBLUE);
              } else {
                this.death = 5;
                ygopro.stoc_send_chat_to_room(this, "${death_start_siding}", ygopro.constants.COLORS.BABYBLUE);
              }
            } else {
              win_pos = this.scores[this.dueling_players[0].name_vpass] > this.scores[this.dueling_players[oppo_pos].name_vpass] ? 0 : oppo_pos;
              this.finished_by_death = true;
              ygopro.stoc_send_chat_to_room(this, "${death2_finish_part1}" + this.dueling_players[win_pos].name + "${death2_finish_part2}", ygopro.constants.COLORS.BABYBLUE);
              if (this.hostinfo.mode === 1) {
                CLIENT_send_replays(this.dueling_players[oppo_pos - win_pos], this);
              }
              ygopro.stoc_send(this.dueling_players[oppo_pos - win_pos], 'DUEL_END');
              if (this.hostinfo.mode === 2) {
                ygopro.stoc_send(this.dueling_players[oppo_pos - win_pos + 1], 'DUEL_END');
              }
              this.scores[this.dueling_players[oppo_pos - win_pos].name_vpass] = -1;
              CLIENT_kick(this.dueling_players[oppo_pos - win_pos]);
              if (this.hostinfo.mode === 2) {
                CLIENT_kick(this.dueling_players[oppo_pos - win_pos + 1]);
              }
            }
            break;
          case 1:
            this.death = -1;
            ygopro.stoc_send_chat_to_room(this, "${death_start_quick}", ygopro.constants.COLORS.BABYBLUE);
            break;
          default:
            this.death = 5;
            ygopro.stoc_send_chat_to_room(this, "${death_start_siding}", ygopro.constants.COLORS.BABYBLUE);
        }
      }
      return true;
    }

    cancel_death() {
      if (this.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN || !this.death) {
        return false;
      }
      this.death = 0;
      ygopro.stoc_send_chat_to_room(this, "${death_cancel}", ygopro.constants.COLORS.BABYBLUE);
      return true;
    }

  };

  // 网络连接
  net.createServer(function(client) {
    var connect_count, server;
    client.ip = client.remoteAddress;
    client.is_local = client.ip && (client.ip.includes('127.0.0.1') || client.ip.includes(real_windbot_server_ip));
    connect_count = ROOM_connected_ip[client.ip] || 0;
    if (!settings.modules.test_mode.no_connect_count_limit && !client.is_local) {
      connect_count++;
    }
    ROOM_connected_ip[client.ip] = connect_count;
    //log.info "connect", client.ip, ROOM_connected_ip[client.ip]

    // server stand for the connection to ygopro server process
    server = new net.Socket();
    client.server = server;
    server.client = client;
    client.setTimeout(2000); //连接前超时2秒
    
    // 释放处理
    client.on('close', function(had_error) {
      var room;
      //log.info "client closed", client.name, had_error
      room = ROOM_all[client.rid];
      connect_count = ROOM_connected_ip[client.ip];
      if (connect_count > 0) {
        connect_count--;
      }
      ROOM_connected_ip[client.ip] = connect_count;
      //log.info "disconnect", client.ip, ROOM_connected_ip[client.ip]
      if (!client.closed) {
        client.closed = true;
        if (settings.modules.heartbeat_detection.enabled) {
          CLIENT_heartbeat_unregister(client);
        }
        if (room) {
          if (!CLIENT_reconnect_register(client, client.rid)) {
            room.disconnect(client);
          }
        } else if (!client.had_new_reconnection) {
          client.server.destroy();
        }
      }
    });
    client.on('error', function(error) {
      var room;
      //log.info "client error", client.name, error
      room = ROOM_all[client.rid];
      connect_count = ROOM_connected_ip[client.ip];
      if (connect_count > 0) {
        connect_count--;
      }
      ROOM_connected_ip[client.ip] = connect_count;
      //log.info "err disconnect", client.ip, ROOM_connected_ip[client.ip]
      if (!client.closed) {
        client.closed = true;
        if (room) {
          if (!CLIENT_reconnect_register(client, client.rid, error)) {
            room.disconnect(client, error);
          }
        } else if (!client.had_new_reconnection) {
          client.server.destroy();
        }
      }
    });
    client.on('timeout', function() {
      if (!(settings.modules.reconnect.enabled && (disconnect_list[CLIENT_get_authorize_key(client)] || client.had_new_reconnection))) {
        client.destroy();
      }
    });
    server.on('close', function(had_error) {
      var room;
      if (!server.closed) {
        server.closed = true;
      }
      if (!server.client) {
        return;
      }
      //log.info "server closed", server.client.name, had_error
      room = ROOM_all[server.client.rid];
      if (room) {
        //log.info "server close", server.client.ip, ROOM_connected_ip[server.client.ip]
        room.disconnector = 'server';
      }
      if (!server.client.closed) {
        ygopro.stoc_send_chat(server.client, "${server_closed}", ygopro.constants.COLORS.RED);
        //if room and settings.modules.replay_delay
        //  room.send_replays()
        CLIENT_kick(server.client);
        SERVER_clear_disconnect(server);
      }
    });
    server.on('error', function(error) {
      var room;
      server.closed = error;
      if (!server.client) {
        return;
      }
      //log.info "server error", client.name, error
      room = ROOM_all[server.client.rid];
      if (room) {
        //log.info "server err close", client.ip, ROOM_connected_ip[client.ip]
        room.disconnector = 'server';
      }
      if (!server.client.closed) {
        ygopro.stoc_send_chat(server.client, `\${server_error}: ${error}`, ygopro.constants.COLORS.RED);
        //if room and settings.modules.replay_delay
        //  room.send_replays()
        CLIENT_kick(server.client);
        SERVER_clear_disconnect(server);
      }
    });
    if (ROOM_bad_ip[client.ip] > 5 || ROOM_connected_ip[client.ip] > 10) {
      log.info('BAD IP', client.ip);
      CLIENT_kick(client);
      return;
    }
    if (settings.modules.cloud_replay.enabled) {
      zlib = require('zlib');
      client.open_cloud_replay = function(err, replay) {
        var buffer;
        if (settings.modules.cloud_replay.engine === 'redis') {
          if (!settings.modules.cloud_replay.never_expire) {
            redisdb.expire("replay:" + replay.replay_id, 60 * 60 * 48);
          }
          buffer = Buffer.from(replay.replay_buffer, 'binary');
        } else if (settings.modules.cloud_replay.engine === 'mysql') {
          if (err || !replay || !replay[0] || !replay[0].replayBuffer) {
            ygopro.stoc_die(client, "${cloud_replay_no}");
            return;
          }
          try {
            buffer = Buffer.from(replay[0].replayBuffer);
          } catch (error1) {
            return;
          }
        }
        zlib.unzip(buffer, function(err, replay_buffer) {
          if (err) {
            log.info("cloud replay unzip error: " + err);
            ygopro.stoc_send_chat(client, "${cloud_replay_error}", ygopro.constants.COLORS.RED);
            CLIENT_kick(client);
            return;
          }
          if (settings.modules.cloud_replay.engine === 'redis') {
            ygopro.stoc_send_chat(client, `\${cloud_replay_playing} R#${replay.replay_id} ${replay.player_names} ${replay.date_time}`, ygopro.constants.COLORS.BABYBLUE);
          }
          if (settings.modules.cloud_replay.engine === 'mysql') {
            ygopro.stoc_send_chat(client, "${cloud_replay_playing} R#" + replay[0].replayId + " " + replay[0].playerNames + " " + replay[0].saveDate, ygopro.constants.COLORS.BABYBLUE);
          }
          client.write(replay_buffer, function() {
            CLIENT_kick(client);
          });
        });
      };
    }
    // 需要重构
    // 客户端到服务端(ctos)协议分析
    client.pre_establish_buffers = new Array();
    client.on('data', function(ctos_buffer) {
      var b, bad_ip_count, buffer, cancel, ctos_event, ctos_message_length, ctos_proto, datas, info, len4, len5, len6, len7, looplimit, o, p, q, r, ref3, ref4, room, struct;
      if (client.is_post_watcher) {
        room = ROOM_all[client.rid];
        if (room && !CLIENT_is_banned_by_mc(client)) {
          room.watcher.write(ctos_buffer);
        }
      } else {
        //ctos_buffer = Buffer.alloc(0)
        ctos_message_length = 0;
        ctos_proto = 0;
        //ctos_buffer = Buffer.concat([ctos_buffer, data], ctos_buffer.length + data.length) #buffer的错误使用方式，好孩子不要学
        datas = [];
        looplimit = 0;
        while (true) {
          if (ctos_message_length === 0) {
            if (ctos_buffer.length >= 2) {
              ctos_message_length = ctos_buffer.readUInt16LE(0);
            } else {
              if (ctos_buffer.length !== 0) {
                log.warn("bad ctos_buffer length", client.ip);
              }
              break;
            }
          } else if (ctos_proto === 0) {
            if (ctos_buffer.length >= 3) {
              ctos_proto = ctos_buffer.readUInt8(2);
            } else {
              log.warn("bad ctos_proto length", client.ip);
              break;
            }
          } else {
            if (ctos_buffer.length >= 2 + ctos_message_length) {
              //console.log "CTOS", ygopro.constants.CTOS[ctos_proto]
              cancel = false;
              if (settings.modules.reconnect.enabled && client.pre_reconnecting && ygopro.constants.CTOS[ctos_proto] !== 'UPDATE_DECK') {
                cancel = true;
              }
              b = ctos_buffer.slice(3, ctos_message_length - 1 + 3);
              info = null;
              struct = ygopro.structs[ygopro.proto_structs.CTOS[ygopro.constants.CTOS[ctos_proto]]];
              if (struct && !cancel) {
                struct._setBuff(b);
                info = _.clone(struct.fields);
              }
              if (ygopro.ctos_follows_before[ctos_proto] && !cancel) {
                ref3 = ygopro.ctos_follows_before[ctos_proto];
                for (o = 0, len4 = ref3.length; o < len4; o++) {
                  ctos_event = ref3[o];
                  result = ctos_event.callback(b, info, client, client.server, datas);
                  if (result && ctos_event.synchronous) {
                    cancel = true;
                  }
                }
              }
              if (struct && !cancel) {
                struct._setBuff(b);
                info = _.clone(struct.fields);
              }
              if (ygopro.ctos_follows[ctos_proto] && !cancel) {
                result = ygopro.ctos_follows[ctos_proto].callback(b, info, client, client.server, datas);
                if (result && ygopro.ctos_follows[ctos_proto].synchronous) {
                  cancel = true;
                }
              }
              if (struct && !cancel) {
                struct._setBuff(b);
                info = _.clone(struct.fields);
              }
              if (ygopro.ctos_follows_after[ctos_proto] && !cancel) {
                ref4 = ygopro.ctos_follows_after[ctos_proto];
                for (p = 0, len5 = ref4.length; p < len5; p++) {
                  ctos_event = ref4[p];
                  result = ctos_event.callback(b, info, client, client.server, datas);
                  if (result && ctos_event.synchronous) {
                    cancel = true;
                  }
                }
              }
              if (!cancel) {
                datas.push(ctos_buffer.slice(0, 2 + ctos_message_length));
              }
              ctos_buffer = ctos_buffer.slice(2 + ctos_message_length);
              ctos_message_length = 0;
              ctos_proto = 0;
            } else {
              if (ctos_message_length !== 17735) {
                log.warn("bad ctos_message length", client.ip, ctos_buffer.length, ctos_message_length, ctos_proto);
              }
              break;
            }
          }
          looplimit++;
          //log.info(looplimit)
          if (looplimit > 800 || ROOM_bad_ip[client.ip] > 5) {
            log.info("error ctos", client.name, client.ip);
            bad_ip_count = ROOM_bad_ip[client.ip];
            if (bad_ip_count) {
              ROOM_bad_ip[client.ip] = bad_ip_count + 1;
            } else {
              ROOM_bad_ip[client.ip] = 1;
            }
            CLIENT_kick(client);
            break;
          }
        }
        if (!client.server) {
          return;
        }
        if (client.established) {
          for (q = 0, len6 = datas.length; q < len6; q++) {
            buffer = datas[q];
            client.server.write(buffer);
          }
        } else {
          for (r = 0, len7 = datas.length; r < len7; r++) {
            buffer = datas[r];
            client.pre_establish_buffers.push(buffer);
          }
        }
      }
    });
    // 服务端到客户端(stoc)
    server.on('data', function(stoc_buffer) {
      var b, buffer, cancel, datas, info, len4, len5, len6, looplimit, o, p, q, ref3, ref4, stoc_event, stoc_message_length, stoc_proto, struct;
      //stoc_buffer = Buffer.alloc(0)
      stoc_message_length = 0;
      stoc_proto = 0;
      //stoc_buffer = Buffer.concat([stoc_buffer, data], stoc_buffer.length + data.length) #buffer的错误使用方式，好孩子不要学

      //unless ygopro.stoc_follows[stoc_proto] and ygopro.stoc_follows[stoc_proto].synchronous
      //server.client.write data
      datas = [];
      looplimit = 0;
      while (true) {
        if (stoc_message_length === 0) {
          if (stoc_buffer.length >= 2) {
            stoc_message_length = stoc_buffer.readUInt16LE(0);
          } else {
            if (stoc_buffer.length !== 0) {
              log.warn("bad stoc_buffer length", server.client.ip);
            }
            break;
          }
        } else if (stoc_proto === 0) {
          if (stoc_buffer.length >= 3) {
            stoc_proto = stoc_buffer.readUInt8(2);
          } else {
            log.warn("bad stoc_proto length", server.client.ip);
            break;
          }
        } else {
          if (stoc_buffer.length >= 2 + stoc_message_length) {
            //console.log "STOC", ygopro.constants.STOC[stoc_proto]
            cancel = false;
            b = stoc_buffer.slice(3, stoc_message_length - 1 + 3);
            info = null;
            struct = ygopro.structs[ygopro.proto_structs.STOC[ygopro.constants.STOC[stoc_proto]]];
            if (struct && !cancel) {
              struct._setBuff(b);
              info = _.clone(struct.fields);
            }
            if (ygopro.stoc_follows_before[stoc_proto] && !cancel) {
              ref3 = ygopro.stoc_follows_before[stoc_proto];
              for (o = 0, len4 = ref3.length; o < len4; o++) {
                stoc_event = ref3[o];
                result = stoc_event.callback(b, info, server.client, server, datas);
                if (result && stoc_event.synchronous) {
                  cancel = true;
                }
              }
            }
            if (struct && !cancel) {
              struct._setBuff(b);
              info = _.clone(struct.fields);
            }
            if (ygopro.stoc_follows[stoc_proto] && !cancel) {
              result = ygopro.stoc_follows[stoc_proto].callback(b, info, server.client, server, datas);
              if (result && ygopro.stoc_follows[stoc_proto].synchronous) {
                cancel = true;
              }
            }
            if (struct && !cancel) {
              struct._setBuff(b);
              info = _.clone(struct.fields);
            }
            if (ygopro.stoc_follows_after[stoc_proto] && !cancel) {
              ref4 = ygopro.stoc_follows_after[stoc_proto];
              for (p = 0, len5 = ref4.length; p < len5; p++) {
                stoc_event = ref4[p];
                result = stoc_event.callback(b, info, server.client, server, datas);
                if (result && stoc_event.synchronous) {
                  cancel = true;
                }
              }
            }
            if (!cancel) {
              datas.push(stoc_buffer.slice(0, 2 + stoc_message_length));
            }
            stoc_buffer = stoc_buffer.slice(2 + stoc_message_length);
            stoc_message_length = 0;
            stoc_proto = 0;
          } else {
            log.warn("bad stoc_message length", server.client.ip);
            break;
          }
        }
        looplimit++;
        //log.info(looplimit)
        if (looplimit > 800) {
          log.info("error stoc", server.client.name);
          server.destroy();
          break;
        }
      }
      if (server.client && !server.client.closed) {
        for (q = 0, len6 = datas.length; q < len6; q++) {
          buffer = datas[q];
          server.client.write(buffer);
        }
      }
    });
  }).listen(settings.port, function() {
    log.info("server started", settings.port);
  });

  if (settings.modules.stop) {
    log.info("NOTE: server not open due to config, ", settings.modules.stop);
  }

  deck_name_match = global.deck_name_match = function(deck_name, player_name) {
    var parsed_deck_name;
    if (deck_name === player_name || deck_name === player_name + ".ydk" || deck_name === player_name + ".ydk.ydk") {
      return true;
    }
    parsed_deck_name = deck_name.match(/^([^\+ \uff0b]+)[\+ \uff0b](.+?)(\.ydk){0,2}$/);
    return parsed_deck_name && (player_name === parsed_deck_name[1] || player_name === parsed_deck_name[2]);
  };

  // 功能模块
  // return true to cancel a synchronous message
  ygopro.ctos_follow('PLAYER_INFO', true, function(buffer, info, client, server, datas) {
    var geo, lang, name, name_full, struct, vpass;
    // checkmate use username$password, but here don't
    // so remove the password
    name_full = info.name.split("$");
    name = name_full[0];
    vpass = name_full[1];
    if (vpass && !vpass.length) {
      vpass = null;
    }
    if (_.any(settings.ban.illegal_id, function(badid) {
      var matchs, regexp;
      regexp = new RegExp(badid, 'i');
      matchs = name.match(regexp);
      if (matchs) {
        name = matchs[1];
        return true;
      }
      return false;
    }, name)) {
      client.rag = true;
    }
    if (settings.modules.mycard.enabled) {
      //console.log(name)
      request({
        url: settings.modules.mycard.ban_get,
        json: true,
        qs: {
          user: name
        }
      }, function(error, response, body) {
        //console.log(body)
        if (_.isString(body)) {
          log.warn("ban get bad json", body);
        } else if (error || !body) {
          log.warn('ban get error', error, response);
        } else {
          client.ban_mc = body;
        }
      });
    }
    struct = ygopro.structs["CTOS_PlayerInfo"];
    struct._setBuff(buffer);
    struct.set("name", name);
    buffer = struct.buffer;
    client.name = name;
    client.vpass = vpass;
    client.name_vpass = vpass ? name + "$" + vpass : name;
    //console.log client.name, client.vpass
    if (settings.modules.vip.enabled && CLIENT_check_vip(client)) {
      client.vip = true;
    }
    if (!settings.modules.i18n.auto_pick || client.is_local) {
      client.lang = settings.modules.i18n.default;
    } else {
      geo = geoip.lookup(client.ip);
      if (!geo) {
        log.warn("fail to locate ip", client.name, client.ip);
        client.lang = settings.modules.i18n.fallback;
      } else {
        if (lang = settings.modules.i18n.map[geo.country]) {
          client.lang = lang;
        } else {
          //log.info("Not in map", geo.country, client.name, client.ip)
          client.lang = settings.modules.i18n.fallback;
        }
      }
    }
    return false;
  });

  ygopro.ctos_follow('JOIN_GAME', false, function(buffer, info, client, server, datas) {
    var buffer_handle_callback, check_buffer_indentity, len4, len5, len6, len7, line, match_permit_callback, name, o, p, pre_room, q, r, ref3, ref4, ref5, ref6, replay_id, room;
    //log.info info
    info.pass = info.pass.trim();
    client.pass = info.pass;
    if (CLIENT_is_able_to_reconnect(client) || CLIENT_is_able_to_kick_reconnect(client)) {
      CLIENT_pre_reconnect(client);
      return;
    } else if (settings.modules.stop) {
      ygopro.stoc_die(client, settings.modules.stop);
    } else if (info.pass === "Marshtomp" || info.pass === "the Big Brother") {
      ygopro.stoc_die(client, "${bad_user_name}");
    } else if (info.pass.toUpperCase() === "R" && settings.modules.cloud_replay.enabled) {
      if (settings.modules.cloud_replay.engine === 'redis') {
        ygopro.stoc_send_chat(client, "${cloud_replay_hint}", ygopro.constants.COLORS.BABYBLUE);
        redisdb.lrange(CLIENT_get_authorize_key(client) + ":replays", 0, 2, function(err, result) {
          _.each(result, function(replay_id, id) {
            redisdb.hgetall("replay:" + replay_id, function(err, replay) {
              if (err || !replay) {
                if (err) {
                  log.info("cloud replay getall error: " + err);
                }
                return;
              }
              ygopro.stoc_send_chat(client, `<${id - 0 + 1}> R#${replay_id} ${replay.player_names} ${replay.date_time}`, ygopro.constants.COLORS.BABYBLUE);
            });
          });
        });
      }
      if (settings.modules.cloud_replay.engine === 'mysql') {
        sql = `SELECT * FROM CloudReplay WHERE ip='${client.ip}' ORDER BY saveDate DESC LIMIT 8`;
        mysqldb.query(sql, function(err, replay) {
          var i, o, ref3, results;
          if (err || !replay) {
            return;
          }
          results = [];
          for (i = o = 0, ref3 = replay.length; (0 <= ref3 ? o < ref3 : o > ref3); i = 0 <= ref3 ? ++o : --o) {
            results.push(ygopro.stoc_send_chat(client, `<${i + 1}> R#${replay[i].replayId} ${replay[i].playerNames} ${replay[i].saveDate}`, ygopro.constants.COLORS.BABYBLUE));
          }
          return results;
        });
      }
      // 强行等待异步执行完毕_(:з」∠)_
      setTimeout((function() {
        ygopro.stoc_send(client, 'ERROR_MSG', {
          msg: 1,
          code: 9
        });
        CLIENT_kick(client);
      }), 500);
    } else if (info.pass.slice(0, 2).toUpperCase() === "R#" && settings.modules.cloud_replay.enabled) {
      replay_id = info.pass.split("#")[1];
      if (replay_id > 0 && replay_id <= 9) {
        if (settings.modules.cloud_replay.engine === 'redis') {
          redisdb.lindex(client.ip + ":replays", replay_id - 1, function(err, replay_id) {
            if (err || !replay_id) {
              if (err) {
                log.info("cloud replay replayid error: " + err);
              }
              ygopro.stoc_die(client, "${cloud_replay_no}");
              return;
            }
            redisdb.hgetall("replay:" + replay_id, client.open_cloud_replay);
          });
        }
        if (settings.modules.cloud_replay.engine === 'mysql') {
          sql = 'SELECT * FROM CloudReplay WHERE ip=#{client.ip} ORDER BY saveDate DESC LIMIT 8;';
          mysqldb.query(sql, function(err, result) {
            if (err || !result || !result[replay_id - 1]) {
              ygopro.stoc_die(client, "${cloud_replay_no}");
              log.info(err);
              return;
            }
            sql = `SELECT * FROM CloudReplay WHERE replayId=${result[replay_id - 1].replayId};`;
            return mysqldb.query(sql, client.open_cloud_replay);
          });
        }
      } else if (replay_id) {
        if (settings.modules.cloud_replay.engine === 'redis') {
          redisdb.hgetall("replay:" + replay_id, client.open_cloud_replay);
        }
        if (settings.modules.cloud_replay.engine === 'mysql') {
          sql = `SELECT * FROM CloudReplay WHERE replayId=${replay_id};`;
          mysqldb.query(sql, client.open_cloud_replay);
        }
      } else {
        ygopro.stoc_die(client, "${cloud_replay_no}");
      }
    } else if (info.pass.toUpperCase() === "W" && settings.modules.cloud_replay.enabled) {
      if (settings.modules.cloud_replay.engine === 'redis') {
        replay_id = Cloud_replay_ids[Math.floor(Math.random() * Cloud_replay_ids.length)];
        redisdb.hgetall("replay:" + replay_id, client.open_cloud_replay);
      }
      if (settings.modules.cloud_replay.engine === 'mysql') {
        sql = "SELECT * FROM CloudReplay ORDER BY RAND() LIMIT 1;";
        mysqldb.query(sql, client.open_cloud_replay);
      }
    } else if (info.version !== settings.version) { // and (info.version < 9020 or settings.version != 4927) #强行兼容23333版
      ygopro.stoc_send_chat(client, settings.modules.update, ygopro.constants.COLORS.RED);
      ygopro.stoc_send(client, 'ERROR_MSG', {
        msg: 4,
        code: settings.version
      });
      CLIENT_kick(client);
    } else if (!info.pass.length && !settings.modules.random_duel.enabled && !settings.modules.windbot.enabled && !settings.modules.challonge.enabled) {
      ygopro.stoc_die(client, "${blank_room_name}");
    } else if (info.pass.length && settings.modules.mycard.enabled && info.pass.slice(0, 3) !== 'AI#') {
      ygopro.stoc_send_chat(client, '${loading_user_info}', ygopro.constants.COLORS.BABYBLUE);
      if (info.pass.length <= 8) {
        ygopro.stoc_die(client, '${invalid_password_length}');
        return;
      }
      //if info.version >= 9020 and settings.version == 4927 #强行兼容23333版
      //  info.version = settings.version
      //  struct = ygopro.structs["CTOS_JoinGame"]
      //  struct._setBuff(buffer)
      //  struct.set("version", info.version)
      //  buffer = struct.buffer
      buffer = Buffer.from(info.pass.slice(0, 8), 'base64');
      if (buffer.length !== 6) {
        ygopro.stoc_die(client, '${invalid_password_payload}');
        return;
      }
      check_buffer_indentity = function(buf) {
        var checksum, i, o, ref3;
        checksum = 0;
        for (i = o = 0, ref3 = buf.length; (0 <= ref3 ? o < ref3 : o > ref3); i = 0 <= ref3 ? ++o : --o) {
          checksum += buf.readUInt8(i);
        }
        return (checksum & 0xFF) === 0;
      };
      buffer_handle_callback = function(buffer, decrypted_buffer, match_permit) {
        var action, len4, len5, len6, len7, line, name, o, opt1, opt2, opt3, options, p, player, q, r, ref3, ref4, ref5, ref6, room, room_title, title;
        if (client.closed) {
          return;
        }
        action = buffer.readUInt8(1) >> 4;
        if (buffer !== decrypted_buffer && (action === 1 || action === 2 || action === 4)) {
          ygopro.stoc_die(client, '${invalid_password_unauthorized}');
          return;
        }
        // 1 create public room
        // 2 create private room
        // 3 join room by id
        // 4 create or join room by id (use for match)
        // 5 join room by title
        switch (action) {
          case 1:
          case 2:
            name = crypto.createHash('md5').update(info.pass + client.name).digest('base64').slice(0, 10).replace('+', '-').replace('/', '_');
            if (ROOM_find_by_name(name)) {
              ygopro.stoc_die(client, '${invalid_password_existed}');
              return;
            }
            opt1 = buffer.readUInt8(2);
            opt2 = buffer.readUInt16LE(3);
            opt3 = buffer.readUInt8(5);
            options = {
              lflist: 0,
              time_limit: 180,
              rule: (opt1 >> 5) & 3,
              mode: (opt1 >> 3) & 3,
              duel_rule: (!!((opt1 >> 2) & 1) ? 3 : 4),
              no_check_deck: !!((opt1 >> 1) & 1),
              no_shuffle_deck: !!(opt1 & 1),
              start_lp: opt2,
              start_hand: opt3 >> 4,
              draw_count: opt3 & 0xF,
              no_watch: false,
              auto_death: false
            };
            options.lflist = _.findIndex(lflists, function(list) {
              return ((options.rule === 1) === list.tcg) && list.date.isBefore();
            });
            room_title = info.pass.slice(8).replace(String.fromCharCode(0xFEFF), ' ');
            if (_.any(badwords.level3, function(badword) {
              var regexp;
              regexp = new RegExp(badword, 'i');
              return room_title.match(regexp);
            }, room_title)) {
              log.warn("BAD ROOM NAME LEVEL 3", room_title, client.name, client.ip);
              ygopro.stoc_die(client, "${bad_roomname_level3}");
              return;
            } else if (_.any(badwords.level2, function(badword) {
              var regexp;
              regexp = new RegExp(badword, 'i');
              return room_title.match(regexp);
            }, room_title)) {
              log.warn("BAD ROOM NAME LEVEL 2", room_title, client.name, client.ip);
              ygopro.stoc_die(client, "${bad_roomname_level2}");
              return;
            } else if (_.any(badwords.level1, function(badword) {
              var regexp;
              regexp = new RegExp(badword, 'i');
              return room_title.match(regexp);
            }, room_title)) {
              log.warn("BAD ROOM NAME LEVEL 1", room_title, client.name, client.ip);
              ygopro.stoc_die(client, "${bad_roomname_level1}");
              return;
            }
            room = new Room(name, options);
            if (room) {
              room.title = room_title;
              room.private = action === 2;
            }
            break;
          case 3:
            name = info.pass.slice(8);
            room = ROOM_find_by_name(name);
            if (!room) {
              ygopro.stoc_die(client, '${invalid_password_not_found}');
              return;
            }
            break;
          case 4:
            if (match_permit && !match_permit.permit) {
              ygopro.stoc_die(client, '${invalid_password_unauthorized}');
              return;
            }
            room = ROOM_find_or_create_by_name('M#' + info.pass.slice(8));
            if (room) {
              ref3 = room.get_playing_player();
              for (o = 0, len4 = ref3.length; o < len4; o++) {
                player = ref3[o];
                if (!(player && player.name === client.name)) {
                  continue;
                }
                ygopro.stoc_die(client, '${invalid_password_unauthorized}');
                return;
              }
              room.private = true;
              room.arena = settings.modules.arena_mode.mode;
              if (room.arena === "athletic") {
                room.max_player = 2;
                room.welcome = "${athletic_arena_tip}";
              }
            }
            break;
          case 5:
            title = info.pass.slice(8).replace(String.fromCharCode(0xFEFF), ' ');
            room = ROOM_find_by_title(title);
            if (!room) {
              ygopro.stoc_die(client, '${invalid_password_not_found}');
              return;
            }
            break;
          default:
            ygopro.stoc_die(client, '${invalid_password_action}');
            return;
        }
        if (!room) {
          ygopro.stoc_die(client, "${server_full}");
        } else if (room.error) {
          ygopro.stoc_die(client, room.error);
        } else if (room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN) {
          if (settings.modules.cloud_replay.enable_halfway_watch && !room.hostinfo.no_watch) {
            client.setTimeout(300000); //连接后超时5分钟
            client.rid = _.indexOf(ROOM_all, room);
            client.is_post_watcher = true;
            if (settings.modules.vip.enabled && client.vip && vip_info.players[client.name].words) {
              ref4 = _.lines(vip_info.players[client.name].words);
              for (p = 0, len5 = ref4.length; p < len5; p++) {
                line = ref4[p];
                ygopro.stoc_send_chat_to_room(room, line, ygopro.constants.COLORS.PINK);
              }
            } else if (settings.modules.words.enabled && words.words[client.name]) {
              ref5 = _.lines(words.words[client.name][Math.floor(Math.random() * words.words[client.name].length)]);
              for (q = 0, len6 = ref5.length; q < len6; q++) {
                line = ref5[q];
                ygopro.stoc_send_chat_to_room(room, line, ygopro.constants.COLORS.PINK);
              }
            }
            ygopro.stoc_send_chat_to_room(room, `${client.name} \${watch_join}`);
            room.watchers.push(client);
            ygopro.stoc_send_chat(client, "${watch_watching}", ygopro.constants.COLORS.BABYBLUE);
            ref6 = room.watcher_buffers;
            for (r = 0, len7 = ref6.length; r < len7; r++) {
              buffer = ref6[r];
              client.write(buffer);
            }
          } else {
            ygopro.stoc_die(client, "${watch_denied}");
          }
        } else if (room.hostinfo.no_watch && room.players.length >= (room.hostinfo.mode === 2 ? 4 : 2)) {
          ygopro.stoc_die(client, "${watch_denied_room}");
        } else {
          //client.room = room
          client.setTimeout(300000); //连接后超时5分钟
          client.rid = _.indexOf(ROOM_all, room);
          room.connect(client);
        }
      };
      match_permit_callback = function(buffer, match_permit) {
        var decrypted_buffer, i, id, len4, o, ref3, secret;
        if (client.closed) {
          return;
        }
        if (id = users_cache[client.name]) {
          secret = id % 65535 + 1;
          decrypted_buffer = Buffer.allocUnsafe(6);
          ref3 = [0, 2, 4];
          for (o = 0, len4 = ref3.length; o < len4; o++) {
            i = ref3[o];
            decrypted_buffer.writeUInt16LE(buffer.readUInt16LE(i) ^ secret, i);
          }
          if (check_buffer_indentity(decrypted_buffer)) {
            return buffer_handle_callback(decrypted_buffer, decrypted_buffer, match_permit);
          }
        }
        //TODO: query database directly, like preload.
        request({
          baseUrl: settings.modules.mycard.auth_base_url,
          url: '/users/' + encodeURIComponent(client.name) + '.json',
          qs: {
            api_key: settings.modules.mycard.auth_key,
            api_username: client.name,
            skip_track_visit: true
          },
          json: true
        }, function(error, response, body) {
          var len5, p, ref4;
          if (!error && body && body.user) {
            users_cache[client.name] = body.user.id;
            secret = body.user.id % 65535 + 1;
            decrypted_buffer = Buffer.allocUnsafe(6);
            ref4 = [0, 2, 4];
            for (p = 0, len5 = ref4.length; p < len5; p++) {
              i = ref4[p];
              decrypted_buffer.writeUInt16LE(buffer.readUInt16LE(i) ^ secret, i);
            }
            if (check_buffer_indentity(decrypted_buffer)) {
              buffer = decrypted_buffer;
            }
          } else {
            log.warn("READ USER FAIL", error, body);
            ygopro.stoc_die(client, "${create_room_failed}");
            return;
          }
          if (!check_buffer_indentity(buffer)) {
            ygopro.stoc_die(client, '${invalid_password_checksum}');
            return;
          }
          return buffer_handle_callback(buffer, decrypted_buffer, match_permit);
        });
      };
      if (settings.modules.arena_mode.check_permit) {
        request({
          url: settings.modules.arena_mode.check_permit,
          json: true,
          qs: {
            username: client.name,
            password: info.pass,
            arena: settings.modules.arena_mode.mode
          }
        }, function(error, response, body) {
          if (client.closed) {
            return;
          }
          if (!error && body) {
            match_permit_callback(buffer, body);
          } else {
            log.warn("Match permit request error", error);
            match_permit_callback(buffer, null);
          }
        });
      } else {
        match_permit_callback(buffer, null);
      }
    } else if (settings.modules.challonge.enabled) {
      pre_room = ROOM_find_by_name(info.pass);
      if (pre_room && pre_room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN && settings.modules.cloud_replay.enable_halfway_watch && !pre_room.hostinfo.no_watch) {
        room = pre_room;
        client.setTimeout(300000); //连接后超时5分钟
        client.rid = _.indexOf(ROOM_all, room);
        client.is_post_watcher = true;
        ygopro.stoc_send_chat_to_room(room, `${client.name} \${watch_join}`);
        room.watchers.push(client);
        ygopro.stoc_send_chat(client, "${watch_watching}", ygopro.constants.COLORS.BABYBLUE);
        ref3 = room.watcher_buffers;
        for (o = 0, len4 = ref3.length; o < len4; o++) {
          buffer = ref3[o];
          client.write(buffer);
        }
      } else {
        ygopro.stoc_send_chat(client, '${loading_user_info}', ygopro.constants.COLORS.BABYBLUE);
        client.setTimeout(300000); //连接后超时5分钟
        challonge.participants._index({
          id: settings.modules.challonge.tournament_id,
          callback: function(err, data) {
            var found, user;
            if (client.closed) {
              return;
            }
            if (err || !data) {
              if (err) {
                log.warn("Failed loading Challonge user info", err);
              }
              ygopro.stoc_die(client, '${challonge_match_load_failed}');
              return;
            }
            found = false;
            for (k in data) {
              user = data[k];
              if (user.participant && user.participant.name && deck_name_match(user.participant.name, client.name)) {
                found = user.participant;
                break;
              }
            }
            if (!found) {
              ygopro.stoc_die(client, '${challonge_user_not_found}');
              return;
            }
            client.challonge_info = found;
            challonge.matches._index({
              id: settings.modules.challonge.tournament_id,
              callback: function(err, data) {
                var len5, len6, len7, len8, line, match, p, player, q, r, ref4, ref5, ref6, ref7, s;
                if (client.closed) {
                  return;
                }
                if (err || !data) {
                  if (err) {
                    log.warn("Failed loading Challonge match info", err);
                  }
                  ygopro.stoc_die(client, '${challonge_match_load_failed}');
                  return;
                }
                found = false;
                for (k in data) {
                  match = data[k];
                  if (match && match.match && !match.match.winnerId && match.match.state !== "complete" && match.match.player1Id && match.match.player2Id && (match.match.player1Id === client.challonge_info.id || match.match.player2Id === client.challonge_info.id)) {
                    found = match.match;
                    break;
                  }
                }
                if (!found) {
                  ygopro.stoc_die(client, '${challonge_match_not_found}');
                  return;
                }
                //if found.winnerId
                //  ygopro.stoc_die(client, '${challonge_match_already_finished}')
                //  return
                room = ROOM_find_or_create_by_name('M#' + found.id);
                if (room) {
                  room.challonge_info = found;
                  // room.max_player = 2
                  room.welcome = "${challonge_match_created}";
                }
                if (!room) {
                  ygopro.stoc_die(client, "${server_full}");
                } else if (room.error) {
                  ygopro.stoc_die(client, room.error);
                } else if (room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN) {
                  if (settings.modules.cloud_replay.enable_halfway_watch && !room.hostinfo.no_watch) {
                    //client.setTimeout(300000) #连接后超时5分钟
                    client.rid = _.indexOf(ROOM_all, room);
                    client.is_post_watcher = true;
                    if (settings.modules.vip.enabled && client.vip && vip_info.players[client.name].words) {
                      ref4 = _.lines(vip_info.players[client.name].words);
                      for (p = 0, len5 = ref4.length; p < len5; p++) {
                        line = ref4[p];
                        ygopro.stoc_send_chat_to_room(room, line, ygopro.constants.COLORS.PINK);
                      }
                    } else if (settings.modules.words.enabled && words.words[client.name]) {
                      ref5 = _.lines(words.words[client.name][Math.floor(Math.random() * words.words[client.name].length)]);
                      for (q = 0, len6 = ref5.length; q < len6; q++) {
                        line = ref5[q];
                        ygopro.stoc_send_chat_to_room(room, line, ygopro.constants.COLORS.PINK);
                      }
                    }
                    ygopro.stoc_send_chat_to_room(room, `${client.name} \${watch_join}`);
                    room.watchers.push(client);
                    ygopro.stoc_send_chat(client, "${watch_watching}", ygopro.constants.COLORS.BABYBLUE);
                    ref6 = room.watcher_buffers;
                    for (r = 0, len7 = ref6.length; r < len7; r++) {
                      buffer = ref6[r];
                      client.write(buffer);
                    }
                  } else {
                    ygopro.stoc_die(client, "${watch_denied}");
                  }
                } else if (room.hostinfo.no_watch && room.players.length >= (room.hostinfo.mode === 2 ? 4 : 2)) {
                  ygopro.stoc_die(client, "${watch_denied_room}");
                } else {
                  ref7 = room.get_playing_player();
                  for (s = 0, len8 = ref7.length; s < len8; s++) {
                    player = ref7[s];
                    if (!(player && player !== client && player.challonge_info.id === client.challonge_info.id)) {
                      continue;
                    }
                    ygopro.stoc_die(client, "${challonge_player_already_in}");
                    return;
                  }
                  //client.room = room
                  //client.setTimeout(300000) #连接后超时5分钟
                  client.rid = _.indexOf(ROOM_all, room);
                  room.connect(client);
                }
              }
            });
          }
        });
      }
    } else if (!client.name || client.name === "") {
      ygopro.stoc_die(client, "${bad_user_name}");
    } else if (ROOM_connected_ip[client.ip] > 5) {
      log.warn("MULTI LOGIN", client.name, client.ip);
      ygopro.stoc_die(client, "${too_much_connection}" + client.ip);
    } else if (_.indexOf(settings.ban.banned_user, client.name) > -1) { //账号被封
      settings.ban.banned_ip.push(client.ip);
      setting_save(settings);
      log.warn("BANNED USER LOGIN", client.name, client.ip);
      ygopro.stoc_die(client, "${banned_user_login}");
    } else if (_.indexOf(settings.ban.banned_ip, client.ip) > -1) { //IP被封
      log.warn("BANNED IP LOGIN", client.name, client.ip);
      ygopro.stoc_die(client, "${banned_ip_login}");
    } else if (!settings.modules.tournament_mode.enabled && !settings.modules.challonge.enabled && _.any(badwords.level3, function(badword) {
      var regexp;
      regexp = new RegExp(badword, 'i');
      return name.match(regexp);
    }, name = client.name)) {
      log.warn("BAD NAME LEVEL 3", client.name, client.ip);
      ygopro.stoc_die(client, "${bad_name_level3}");
    } else if (!settings.modules.tournament_mode.enabled && !settings.modules.challonge.enabled && _.any(badwords.level2, function(badword) {
      var regexp;
      regexp = new RegExp(badword, 'i');
      return name.match(regexp);
    }, name = client.name)) {
      log.warn("BAD NAME LEVEL 2", client.name, client.ip);
      ygopro.stoc_die(client, "${bad_name_level2}");
    } else if (!settings.modules.tournament_mode.enabled && !settings.modules.challonge.enabled && _.any(badwords.level1, function(badword) {
      var regexp;
      regexp = new RegExp(badword, 'i');
      return name.match(regexp);
    }, name = client.name)) {
      log.warn("BAD NAME LEVEL 1", client.name, client.ip);
      ygopro.stoc_die(client, "${bad_name_level1}");
    } else if (info.pass.length && !ROOM_validate(info.pass)) {
      ygopro.stoc_die(client, "${invalid_password_room}");
    } else {
      //if info.version >= 9020 and settings.version == 4927 #强行兼容23333版
      //  info.version = settings.version
      //  struct = ygopro.structs["CTOS_JoinGame"]
      //  struct._setBuff(buffer)
      //  struct.set("version", info.version)
      //  buffer = struct.buffer
      //  #ygopro.stoc_send_chat(client, "看起来你是YGOMobile的用户，请记得更新先行卡补丁，否则会看到白卡", ygopro.constants.COLORS.GREEN)

      //log.info 'join_game',info.pass, client.name
      room = ROOM_find_or_create_by_name(info.pass, client.ip);
      if (!room) {
        ygopro.stoc_die(client, "${server_full}");
      } else if (room.error) {
        ygopro.stoc_die(client, room.error);
      } else if (room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN) {
        if (settings.modules.cloud_replay.enable_halfway_watch && !room.hostinfo.no_watch) {
          client.setTimeout(300000); //连接后超时5分钟
          client.rid = _.indexOf(ROOM_all, room);
          client.is_post_watcher = true;
          if (settings.modules.vip.enabled && client.vip && vip_info.players[client.name].words) {
            ref4 = _.lines(vip_info.players[client.name].words);
            for (p = 0, len5 = ref4.length; p < len5; p++) {
              line = ref4[p];
              ygopro.stoc_send_chat_to_room(room, line, ygopro.constants.COLORS.PINK);
            }
          } else if (settings.modules.words.enabled && words.words[client.name]) {
            ref5 = _.lines(words.words[client.name][Math.floor(Math.random() * words.words[client.name].length)]);
            for (q = 0, len6 = ref5.length; q < len6; q++) {
              line = ref5[q];
              ygopro.stoc_send_chat_to_room(room, line, ygopro.constants.COLORS.PINK);
            }
          }
          ygopro.stoc_send_chat_to_room(room, `${client.name} \${watch_join}`);
          room.watchers.push(client);
          ygopro.stoc_send_chat(client, "${watch_watching}", ygopro.constants.COLORS.BABYBLUE);
          ref6 = room.watcher_buffers;
          for (r = 0, len7 = ref6.length; r < len7; r++) {
            buffer = ref6[r];
            client.write(buffer);
          }
        } else {
          ygopro.stoc_die(client, "${watch_denied}");
        }
      } else if (room.hostinfo.no_watch && room.players.length >= (room.hostinfo.mode === 2 ? 4 : 2)) {
        ygopro.stoc_die(client, "${watch_denied_room}");
      } else {
        client.setTimeout(300000); //连接后超时5分钟
        client.rid = _.indexOf(ROOM_all, room);
        room.connect(client);
      }
    }
  });

  ygopro.stoc_follow('JOIN_GAME', false, function(buffer, info, client, server, datas) {
    var len4, len5, len6, line, o, p, player, q, recorder, ref3, ref4, ref5, room, watcher;
    //欢迎信息
    room = ROOM_all[client.rid];
    if (!(room && !client.reconnecting)) {
      return;
    }
    if (!room.join_game_buffer) {
      room.join_game_buffer = buffer;
    }
    if (settings.modules.vip.enabled && client.vip && vip_info.players[client.name].words) {
      ref3 = _.lines(vip_info.players[client.name].words);
      for (o = 0, len4 = ref3.length; o < len4; o++) {
        line = ref3[o];
        ygopro.stoc_send_chat_to_room(room, line, ygopro.constants.COLORS.PINK);
      }
    } else if (settings.modules.words.enabled && words.words[client.name]) {
      ref4 = _.lines(words.words[client.name][Math.floor(Math.random() * words.words[client.name].length)]);
      for (p = 0, len5 = ref4.length; p < len5; p++) {
        line = ref4[p];
        ygopro.stoc_send_chat_to_room(room, line, ygopro.constants.COLORS.PINK);
      }
    }
    if (settings.modules.welcome) {
      ygopro.stoc_send_chat(client, settings.modules.welcome, ygopro.constants.COLORS.GREEN);
    }
    if (room.welcome) {
      ygopro.stoc_send_chat(client, room.welcome, ygopro.constants.COLORS.BABYBLUE);
    }
    if (settings.modules.arena_mode.enabled && !client.is_local) { //and not client.score_shown
      request({
        url: settings.modules.arena_mode.get_score + encodeURIComponent(client.name),
        json: true
      }, function(error, response, body) {
        var rank_txt;
        if (error) {
          log.warn('LOAD SCORE ERROR', client.name, error);
        } else if (!body || _.isString(body)) {
          log.warn('LOAD SCORE FAIL', client.name, response.statusCode, response.statusMessage, body);
        } else {
          //log.info 'LOAD SCORE', client.name, body
          rank_txt = body.arena_rank > 0 ? "${rank_arena}" + body.arena_rank : "${rank_blank}";
          ygopro.stoc_send_chat(client, `${client.name}\${exp_value_part1}${body.exp}\${exp_value_part2}\${exp_value_part3}${Math.round(body.pt)}${rank_txt}\${exp_value_part4}`, ygopro.constants.COLORS.BABYBLUE);
        }
      });
    }
    //client.score_shown = true
    if (settings.modules.random_duel.record_match_scores && room.random_type === 'M') {
      ygopro.stoc_send_chat_to_room(room, ROOM_player_get_score(client), ygopro.constants.COLORS.GREEN);
      ref5 = room.players;
      for (q = 0, len6 = ref5.length; q < len6; q++) {
        player = ref5[q];
        if (player.pos !== 7 && player !== client) {
          ygopro.stoc_send_chat(client, ROOM_player_get_score(player), ygopro.constants.COLORS.GREEN);
        }
      }
    }
    if (!room.recorder) {
      room.recorder = recorder = net.connect(room.port, function() {
        ygopro.ctos_send(recorder, 'PLAYER_INFO', {
          name: "Marshtomp"
        });
        ygopro.ctos_send(recorder, 'JOIN_GAME', {
          version: settings.version,
          pass: "Marshtomp"
        });
        ygopro.ctos_send(recorder, 'HS_TOOBSERVER');
      });
      recorder.on('data', function(data) {
        room = ROOM_all[client.rid];
        if (!(room && settings.modules.cloud_replay.enabled)) {
          return;
        }
        room.recorder_buffers.push(data);
      });
      recorder.on('error', function(error) {});
    }
    if (settings.modules.cloud_replay.enable_halfway_watch && !room.watcher && !room.hostinfo.no_watch) {
      room.watcher = watcher = settings.modules.test_mode.watch_public_hand ? room.recorder : net.connect(room.port, function() {
        ygopro.ctos_send(watcher, 'PLAYER_INFO', {
          name: "the Big Brother"
        });
        ygopro.ctos_send(watcher, 'JOIN_GAME', {
          version: settings.version,
          pass: "the Big Brother"
        });
        ygopro.ctos_send(watcher, 'HS_TOOBSERVER');
      });
      watcher.on('data', function(data) {
        var len7, r, ref6, w;
        room = ROOM_all[client.rid];
        if (!room) {
          return;
        }
        room.watcher_buffers.push(data);
        ref6 = room.watchers;
        for (r = 0, len7 = ref6.length; r < len7; r++) {
          w = ref6[r];
          if (w) { //a WTF fix
            w.write(data);
          }
        }
      });
      watcher.on('error', function(error) {});
    }
  });

  // 登场台词
  //log.error "watcher error", error
  load_words = global.load_words = function() {
    request({
      url: settings.modules.words.get,
      json: true
    }, function(error, response, body) {
      if (_.isString(body)) {
        log.warn("words bad json", body);
      } else if (error || !body) {
        log.warn('words error', error, response);
      } else {
        setting_change(words, "words", body);
        log.info("words loaded", _.size(words.words));
      }
    });
  };

  if (settings.modules.words.get) {
    load_words();
  }

  load_dialogues = global.load_dialogues = function() {
    request({
      url: settings.modules.dialogues.get,
      json: true
    }, function(error, response, body) {
      if (_.isString(body)) {
        log.warn("dialogues bad json", body);
      } else if (error || !body) {
        log.warn('dialogues error', error, response);
      } else {
        setting_change(dialogues, "dialogues", body);
        log.info("dialogues loaded", _.size(dialogues.dialogues));
      }
    });
  };

  load_dialogues_custom = global.load_dialogues_custom = function() {
    request({
      url: settings.modules.dialogues.get_custom,
      json: true
    }, function(error, response, body) {
      if (_.isString(body)) {
        log.warn("custom dialogues bad json", body);
      } else if (error || !body) {
        log.warn('custom dialogues error', error, response);
      } else {
        setting_change(dialogues, "dialogues_custom", body);
        log.info("custom dialogues loaded", _.size(dialogues.dialogues_custom));
      }
    });
  };

  if (settings.modules.dialogues.get) {
    load_dialogues();
  }

  if (settings.modules.dialogues.get_custom) {
    load_dialogues_custom();
  }

  ygopro.stoc_follow('GAME_MSG', true, function(buffer, info, client, server, datas) {
    var act_pos, chain, check, count, cpos, deck_found, found, hint_type, i, i1, id, len10, len11, len12, len4, len5, len6, len7, len8, len9, limbo_found, line, loc, max_loop, msg, o, oppo_pos, p, phase, player, playertype, pos, ppos, q, r, r_player, reason, ref10, ref11, ref12, ref13, ref3, ref4, ref5, ref6, ref7, ref8, ref9, room, s, t, trigger_location, val, win_pos, x, y, z;
    room = ROOM_all[client.rid];
    if (!(room && !client.reconnecting)) {
      return;
    }
    msg = buffer.readInt8(0);
    if (settings.modules.retry_handle.enabled) {
      if (ygopro.constants.MSG[msg] === 'RETRY') {
        if (client.retry_count == null) {
          client.retry_count = 0;
        }
        client.retry_count++;
        log.warn("MSG_RETRY detected", client.name, client.ip, msg, client.retry_count);
        if (settings.modules.retry_handle.max_retry_count && client.retry_count >= settings.modules.retry_handle.max_retry_count) {
          ygopro.stoc_send_chat_to_room(room, client.name + "${retry_too_much_room_part1}" + settings.modules.retry_handle.max_retry_count + "${retry_too_much_room_part2}", ygopro.constants.COLORS.BABYBLUE);
          ygopro.stoc_send_chat(client, "${retry_too_much_part1}" + settings.modules.retry_handle.max_retry_count + "${retry_too_much_part2}", ygopro.constants.COLORS.RED);
          CLIENT_send_replays(client, room);
          CLIENT_kick(client);
          return true;
        }
        if (client.last_game_msg) {
          if (settings.modules.retry_handle.max_retry_count) {
            ygopro.stoc_send_chat(client, "${retry_part1}" + client.retry_count + "${retry_part2}" + settings.modules.retry_handle.max_retry_count + "${retry_part3}", ygopro.constants.COLORS.RED);
          } else {
            ygopro.stoc_send_chat(client, "${retry_not_counted}", ygopro.constants.COLORS.BABYBLUE);
          }
          if (client.last_hint_msg) {
            ygopro.stoc_send(client, 'GAME_MSG', client.last_hint_msg);
          }
          ygopro.stoc_send(client, 'GAME_MSG', client.last_game_msg);
          return true;
        }
      } else {
        client.last_game_msg = buffer;
        client.last_game_msg_title = ygopro.constants.MSG[msg];
      }
    // log.info(client.name, client.last_game_msg_title)
    } else if (ygopro.constants.MSG[msg] !== 'RETRY') {
      client.last_game_msg = buffer;
      client.last_game_msg_title = ygopro.constants.MSG[msg];
    }
    // log.info(client.name, client.last_game_msg_title)
    if ((msg >= 10 && msg < 30) || msg === 132 || (msg >= 140 && msg <= 144)) { //SELECT和ANNOUNCE开头的消息
      room.waiting_for_player = client;
      room.last_active_time = moment();
    }
    //log.info("#{ygopro.constants.MSG[msg]}等待#{room.waiting_for_player.name}")

    //log.info 'MSG', ygopro.constants.MSG[msg]
    if (ygopro.constants.MSG[msg] === 'START') {
      playertype = buffer.readUInt8(1);
      client.is_first = !(playertype & 0xf);
      client.lp = room.hostinfo.start_lp;
      if (room.hostinfo.mode !== 2) {
        client.card_count = 0;
      }
      room.duel_stage = ygopro.constants.DUEL_STAGE.DUELING;
      if (client.pos === 0) {
        room.turn = 0;
        room.duel_count++;
        if (room.death && room.duel_count > 1) {
          if (room.death === -1) {
            ygopro.stoc_send_chat_to_room(room, "${death_start_final}", ygopro.constants.COLORS.BABYBLUE);
          } else {
            ygopro.stoc_send_chat_to_room(room, "${death_start_extra}", ygopro.constants.COLORS.BABYBLUE);
          }
        }
      }
      if (client.is_first && (room.hostinfo.mode !== 2 || client.pos === 0 || client.pos === 2)) {
        room.first_list.push(client.name_vpass);
      }
      if (settings.modules.retry_handle.enabled) {
        client.retry_count = 0;
        client.last_game_msg = null;
      }
    }
    //ygopro.stoc_send_chat_to_room(room, "LP跟踪调试信息: #{client.name} 初始LP #{client.lp}")
    if (ygopro.constants.MSG[msg] === 'HINT') {
      hint_type = buffer.readUInt8(1);
      if (hint_type === 3) {
        client.last_hint_msg = buffer;
      }
    }
    if (ygopro.constants.MSG[msg] === 'NEW_TURN') {
      r_player = buffer.readUInt8(1);
      if (client.pos === 0 && (r_player & 0x2) === 0) {
        room.turn++;
        if (room.death && room.death !== -2) {
          if (room.turn >= room.death) {
            oppo_pos = room.hostinfo.mode === 2 ? 2 : 1;
            if (room.dueling_players[0].lp !== room.dueling_players[oppo_pos].lp && room.turn > 1) {
              win_pos = room.dueling_players[0].lp > room.dueling_players[oppo_pos].lp ? 0 : oppo_pos;
              ygopro.stoc_send_chat_to_room(room, "${death_finish_part1}" + room.dueling_players[win_pos].name + "${death_finish_part2}", ygopro.constants.COLORS.BABYBLUE);
              ygopro.ctos_send(room.dueling_players[oppo_pos - win_pos].server, 'SURRENDER');
            } else {
              room.death = -1;
              ygopro.stoc_send_chat_to_room(room, "${death_remain_final}", ygopro.constants.COLORS.BABYBLUE);
            }
          } else {
            ygopro.stoc_send_chat_to_room(room, "${death_remain_part1}" + (room.death - room.turn) + "${death_remain_part2}", ygopro.constants.COLORS.BABYBLUE);
          }
        }
      }
      if (client.surrend_confirm) {
        client.surrend_confirm = false;
        ygopro.stoc_send_chat(client, "${surrender_canceled}", ygopro.constants.COLORS.BABYBLUE);
      }
    }
    if (ygopro.constants.MSG[msg] === 'NEW_PHASE') {
      phase = buffer.readInt16LE(1);
      oppo_pos = room.hostinfo.mode === 2 ? 2 : 1;
      if (client.pos === 0 && room.death === -2 && !(phase === 0x1 && room.turn < 2)) {
        if (room.dueling_players[0].lp !== room.dueling_players[oppo_pos].lp) {
          win_pos = room.dueling_players[0].lp > room.dueling_players[oppo_pos].lp ? 0 : oppo_pos;
          ygopro.stoc_send_chat_to_room(room, "${death_finish_part1}" + room.dueling_players[win_pos].name + "${death_finish_part2}", ygopro.constants.COLORS.BABYBLUE);
          ygopro.ctos_send(room.dueling_players[oppo_pos - win_pos].server, 'SURRENDER');
        } else {
          room.death = -1;
          ygopro.stoc_send_chat_to_room(room, "${death_remain_final}", ygopro.constants.COLORS.BABYBLUE);
        }
      }
    }
    if (ygopro.constants.MSG[msg] === 'WIN' && client.pos === 0) {
      pos = buffer.readUInt8(1);
      if (!(client.is_first || pos === 2 || room.duel_stage !== ygopro.constants.DUEL_STAGE.DUELING)) {
        pos = 1 - pos;
      }
      if (pos >= 0 && room.hostinfo.mode === 2) {
        pos = pos * 2;
      }
      reason = buffer.readUInt8(2);
      //log.info {winner: pos, reason: reason}
      //room.duels.push {winner: pos, reason: reason}
      room.winner = pos;
      room.turn = 0;
      room.duel_stage = ygopro.constants.DUEL_STAGE.END;
      if (settings.modules.heartbeat_detection.enabled) {
        ref3 = room.players;
        for (o = 0, len4 = ref3.length; o < len4; o++) {
          player = ref3[o];
          player.heartbeat_protected = false;
        }
        delete room.long_resolve_card;
        delete room.long_resolve_chain;
      }
      if (room && !room.finished && room.dueling_players[pos]) {
        room.winner_name = room.dueling_players[pos].name_vpass;
        //log.info room.dueling_players, pos
        room.scores[room.winner_name] = room.scores[room.winner_name] + 1;
        if (room.match_kill) {
          room.match_kill = false;
          room.scores[room.winner_name] = 99;
        }
        if (settings.modules.vip.enabled && room.dueling_players[pos].vip && vip_info.players[room.dueling_players[pos].name].victory) {
          ref4 = _.lines(vip_info.players[room.dueling_players[pos].name].victory);
          for (p = 0, len5 = ref4.length; p < len5; p++) {
            line = ref4[p];
            ygopro.stoc_send_chat_to_room(room, line, ygopro.constants.COLORS.PINK);
          }
        } else if (room.hostinfo.mode === 2 && settings.modules.vip.enabled && room.dueling_players[pos + 1].vip && vip_info.players[room.dueling_players[pos + 1].name].victory) {
          ref5 = _.lines(vip_info.players[room.dueling_players[pos + 1].name].victory);
          for (q = 0, len6 = ref5.length; q < len6; q++) {
            line = ref5[q];
            ygopro.stoc_send_chat_to_room(room, line, ygopro.constants.COLORS.PINK);
          }
        }
      }
      if (room.death) {
        if (settings.modules.http.quick_death_rule === 1 || settings.modules.http.quick_death_rule === 3) {
          room.death = -1;
        } else {
          room.death = 5;
        }
      }
    }
    if (ygopro.constants.MSG[msg] === 'MATCH_KILL' && client.pos === 0) {
      room.match_kill = true;
    }
    //lp跟踪
    if (ygopro.constants.MSG[msg] === 'DAMAGE' && client.pos === 0) {
      pos = buffer.readUInt8(1);
      if (!client.is_first) {
        pos = 1 - pos;
      }
      if (pos >= 0 && room.hostinfo.mode === 2) {
        pos = pos * 2;
      }
      val = buffer.readInt32LE(2);
      room.dueling_players[pos].lp -= val;
      if (room.dueling_players[pos].lp < 0) {
        room.dueling_players[pos].lp = 0;
      }
      if ((0 < (ref6 = room.dueling_players[pos].lp) && ref6 <= 100)) {
        ygopro.stoc_send_chat_to_room(room, "${lp_low_opponent}", ygopro.constants.COLORS.PINK);
      }
    }
    if (ygopro.constants.MSG[msg] === 'RECOVER' && client.pos === 0) {
      pos = buffer.readUInt8(1);
      if (!client.is_first) {
        pos = 1 - pos;
      }
      if (pos >= 0 && room.hostinfo.mode === 2) {
        pos = pos * 2;
      }
      val = buffer.readInt32LE(2);
      room.dueling_players[pos].lp += val;
    }
    if (ygopro.constants.MSG[msg] === 'LPUPDATE' && client.pos === 0) {
      pos = buffer.readUInt8(1);
      if (!client.is_first) {
        pos = 1 - pos;
      }
      if (pos >= 0 && room.hostinfo.mode === 2) {
        pos = pos * 2;
      }
      val = buffer.readInt32LE(2);
      room.dueling_players[pos].lp = val;
    }
    if (ygopro.constants.MSG[msg] === 'PAY_LPCOST' && client.pos === 0) {
      pos = buffer.readUInt8(1);
      if (!client.is_first) {
        pos = 1 - pos;
      }
      if (pos >= 0 && room.hostinfo.mode === 2) {
        pos = pos * 2;
      }
      val = buffer.readInt32LE(2);
      room.dueling_players[pos].lp -= val;
      if (room.dueling_players[pos].lp < 0) {
        room.dueling_players[pos].lp = 0;
      }
      if ((0 < (ref7 = room.dueling_players[pos].lp) && ref7 <= 100)) {
        ygopro.stoc_send_chat_to_room(room, "${lp_low_self}", ygopro.constants.COLORS.PINK);
      }
    }
    //track card count
    //todo: track card count in tag mode
    if (ygopro.constants.MSG[msg] === 'MOVE' && room.hostinfo.mode !== 2) {
      pos = buffer.readUInt8(5);
      if (!client.is_first) {
        pos = 1 - pos;
      }
      loc = buffer.readUInt8(6);
      if ((loc & 0xe) && pos === 0) {
        client.card_count--;
      }
      pos = buffer.readUInt8(9);
      if (!client.is_first) {
        pos = 1 - pos;
      }
      loc = buffer.readUInt8(10);
      if ((loc & 0xe) && pos === 0) {
        client.card_count++;
      }
    }
    if (ygopro.constants.MSG[msg] === 'DRAW' && room.hostinfo.mode !== 2) {
      pos = buffer.readUInt8(1);
      if (!client.is_first) {
        pos = 1 - pos;
      }
      if (pos === 0) {
        count = buffer.readInt8(2);
        client.card_count += count;
      }
    }
    // check panel confirming cards in heartbeat
    if (settings.modules.heartbeat_detection.enabled && ygopro.constants.MSG[msg] === 'CONFIRM_CARDS') {
      check = false;
      count = buffer.readInt8(2);
      max_loop = 3 + (count - 1) * 7;
      deck_found = 0;
      limbo_found = 0; // support custom cards which may be in location 0 in KoishiPro or EdoPro
      for (i = r = 3, ref8 = max_loop; r <= ref8; i = r += 7) {
        loc = buffer.readInt8(i + 5);
        if ((loc & 0x41) > 0) {
          deck_found++;
        } else if (loc === 0) {
          limbo_found++;
        }
        if ((deck_found > 0 && count > 1) || limbo_found > 0) {
          check = true;
          break;
        }
      }
      if (check) {
        //console.log("Confirming cards:" + client.name)
        client.heartbeat_protected = true;
      }
    }
    // chain detection
    if (settings.modules.heartbeat_detection.enabled && client.pos === 0) {
      if (ygopro.constants.MSG[msg] === 'CHAINING') {
        card = buffer.readUInt32LE(1);
        found = false;
        for (s = 0, len7 = long_resolve_cards.length; s < len7; s++) {
          id = long_resolve_cards[s];
          if (!(id === card)) {
            continue;
          }
          found = true;
          break;
        }
        if (found) {
          room.long_resolve_card = card;
        } else {
          // console.log(0,card)
          delete room.long_resolve_card;
        }
      } else if (ygopro.constants.MSG[msg] === 'CHAINED' && room.long_resolve_card) {
        chain = buffer.readInt8(1);
        if (!room.long_resolve_chain) {
          room.long_resolve_chain = [];
        }
        room.long_resolve_chain[chain] = true;
        // console.log(1,chain)
        delete room.long_resolve_card;
      } else if (ygopro.constants.MSG[msg] === 'CHAIN_SOLVING' && room.long_resolve_chain) {
        chain = buffer.readInt8(1);
        // console.log(2,chain)
        if (room.long_resolve_chain[chain]) {
          ref9 = room.get_playing_player();
          for (t = 0, len8 = ref9.length; t < len8; t++) {
            player = ref9[t];
            player.heartbeat_protected = true;
          }
        }
      } else if ((ygopro.constants.MSG[msg] === 'CHAIN_NEGATED' || ygopro.constants.MSG[msg] === 'CHAIN_DISABLED') && room.long_resolve_chain) {
        chain = buffer.readInt8(1);
        // console.log(3,chain)
        delete room.long_resolve_chain[chain];
      } else if (ygopro.constants.MSG[msg] === 'CHAIN_END') {
        // console.log(4,chain)
        delete room.long_resolve_card;
        delete room.long_resolve_chain;
      }
    }
    //登场台词
    if (settings.modules.dialogues.enabled || settings.modules.vip.enabled) {
      if (ygopro.constants.MSG[msg] === 'SUMMONING' || ygopro.constants.MSG[msg] === 'SPSUMMONING' || ygopro.constants.MSG[msg] === 'CHAINING') {
        card = buffer.readUInt32LE(1);
        trigger_location = buffer.readUInt8(6);
        act_pos = buffer.readUInt8(ygopro.constants.MSG[msg] === 'CHAINING' ? 9 : 5);
        if (!room.dueling_players[0].is_first) {
          act_pos = 1 - act_pos;
        }
        if (room.hostinfo.mode === 2) {
          act_pos = act_pos * 2;
        }
        if (ygopro.constants.MSG[msg] !== 'CHAINING' || (trigger_location & 0x8) && client.ready_trap) {
          if (settings.modules.vip.enabled && room.dueling_players[act_pos].vip && vip_info.players[room.dueling_players[act_pos].name].dialogues[card]) {
            ref10 = _.lines(vip_info.players[room.dueling_players[act_pos].name].dialogues[card]);
            for (x = 0, len9 = ref10.length; x < len9; x++) {
              line = ref10[x];
              ygopro.stoc_send_chat(client, line, ygopro.constants.COLORS.PINK);
            }
          } else if (settings.modules.vip.enabled && room.hostinfo.mode === 2 && room.dueling_players[act_pos + 1].vip && vip_info.players[room.dueling_players[act_pos + 1].name].dialogues[card]) {
            ref11 = _.lines(vip_info.players[room.dueling_players[act_pos + 1].name].dialogues[card]);
            for (y = 0, len10 = ref11.length; y < len10; y++) {
              line = ref11[y];
              ygopro.stoc_send_chat(client, line, ygopro.constants.COLORS.PINK);
            }
          } else if (settings.modules.dialogues.enabled && dialogues.dialogues[card]) {
            ref12 = _.lines(dialogues.dialogues[card][Math.floor(Math.random() * dialogues.dialogues[card].length)]);
            for (z = 0, len11 = ref12.length; z < len11; z++) {
              line = ref12[z];
              ygopro.stoc_send_chat(client, line, ygopro.constants.COLORS.PINK);
            }
          } else if (settings.modules.dialogues.enabled && dialogues.dialogues_custom[card]) {
            ref13 = _.lines(dialogues.dialogues_custom[card][Math.floor(Math.random() * dialogues.dialogues_custom[card].length)]);
            for (i1 = 0, len12 = ref13.length; i1 < len12; i1++) {
              line = ref13[i1];
              ygopro.stoc_send_chat(client, line, ygopro.constants.COLORS.PINK);
            }
          }
        }
      }
      if (ygopro.constants.MSG[msg] === 'POS_CHANGE') {
        loc = buffer.readUInt8(6);
        ppos = buffer.readUInt8(8);
        cpos = buffer.readUInt8(9);
        client.ready_trap = !!(loc & 0x8) && !!(ppos & 0xa) && !!(cpos & 0x5);
      } else if (ygopro.constants.MSG[msg] !== 'UPDATE_CARD' && ygopro.constants.MSG[msg] !== 'WAITING') {
        client.ready_trap = false;
      }
    }
    return false;
  });

  //房间管理
  ygopro.ctos_follow('HS_TOOBSERVER', true, function(buffer, info, client, server, datas) {
    var len4, o, player, ref3, room;
    room = ROOM_all[client.rid];
    if (!room) {
      return;
    }
    if (room.hostinfo.no_watch) {
      ygopro.stoc_send_chat(client, "${watch_denied_room}", ygopro.constants.COLORS.RED);
      return true;
    }
    if ((!room.arena && !settings.modules.challonge.enabled) || client.is_local) {
      return false;
    }
    ref3 = room.players;
    for (o = 0, len4 = ref3.length; o < len4; o++) {
      player = ref3[o];
      if (player === client) {
        ygopro.stoc_send_chat(client, "${cannot_to_observer}", ygopro.constants.COLORS.BABYBLUE);
        return true;
      }
    }
    return false;
  });

  ygopro.ctos_follow('HS_KICK', true, function(buffer, info, client, server, datas) {
    var len4, o, player, ref3, room;
    room = ROOM_all[client.rid];
    if (!room) {
      return;
    }
    ref3 = room.players;
    for (o = 0, len4 = ref3.length; o < len4; o++) {
      player = ref3[o];
      if (player && player.pos === info.pos && player !== client) {
        if (room.arena === "athletic" || settings.modules.challonge.enabled) {
          ygopro.stoc_send_chat_to_room(room, `${client.name} \${kicked_by_system}`, ygopro.constants.COLORS.RED);
          CLIENT_kick(client);
          return true;
        }
        client.kick_count = client.kick_count ? client.kick_count + 1 : 1;
        if (client.kick_count >= 5 && room.random_type) {
          ygopro.stoc_send_chat_to_room(room, `${client.name} \${kicked_by_system}`, ygopro.constants.COLORS.RED);
          ROOM_ban_player(player.name, player.ip, "${random_ban_reason_zombie}");
          CLIENT_kick(client);
          return true;
        }
        ygopro.stoc_send_chat_to_room(room, `${player.name} \${kicked_by_player}`, ygopro.constants.COLORS.RED);
      }
    }
    return false;
  });

  ygopro.stoc_follow('TYPE_CHANGE', true, function(buffer, info, client, server, datas) {
    var is_host, selftype;
    selftype = info.type & 0xf;
    is_host = ((info.type >> 4) & 0xf) !== 0;
    // if room and room.hostinfo.no_watch and selftype == 7
    //   ygopro.stoc_die(client, "${watch_denied_room}")
    //   return true
    client.is_host = is_host;
    client.pos = selftype;
    //console.log "TYPE_CHANGE to #{client.name}:", info, selftype, is_host
    return false;
  });

  ygopro.stoc_follow('HS_PLAYER_ENTER', true, function(buffer, info, client, server, datas) {
    var pos, room, struct;
    room = ROOM_all[client.rid];
    if (!(room && settings.modules.hide_name && room.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN)) {
      return false;
    }
    pos = info.pos;
    if (pos < 4 && pos !== client.pos) {
      struct = ygopro.structs["STOC_HS_PlayerEnter"];
      struct._setBuff(buffer);
      struct.set("name", "********");
      buffer = struct.buffer;
    }
    return false;
  });

  ygopro.stoc_follow('HS_PLAYER_CHANGE', false, function(buffer, info, client, server, datas) {
    var is_ready, len4, len5, o, p, p1, p2, player, pos, ref3, ref4, room;
    room = ROOM_all[client.rid];
    if (!(room && room.max_player && client.is_host)) {
      return;
    }
    pos = info.status >> 4;
    is_ready = (info.status & 0xf) === 9;
    if (pos < room.max_player) {
      if (room.arena) {
        room.ready_player_count = 0;
        ref3 = room.players;
        for (o = 0, len4 = ref3.length; o < len4; o++) {
          player = ref3[o];
          if (player.pos === pos) {
            player.is_ready = is_ready;
          }
        }
        p1 = room.players[0];
        p2 = room.players[1];
        if (!p1 || !p2) {
          if (room.waiting_for_player_interval) {
            clearInterval(room.waiting_for_player_interval);
            room.waiting_for_player_interval = null;
          }
          return;
        }
        room.waiting_for_player2 = room.waiting_for_player;
        room.waiting_for_player = null;
        if (p1.is_ready && p2.is_ready) {
          room.waiting_for_player = p1.is_host ? p1 : p2;
        }
        if (!p1.is_ready && p2.is_ready) {
          room.waiting_for_player = p1;
        }
        if (!p2.is_ready && p1.is_ready) {
          room.waiting_for_player = p2;
        }
        if (room.waiting_for_player !== room.waiting_for_player2) {
          room.waiting_for_player2 = room.waiting_for_player;
          room.waiting_for_player_time = settings.modules.arena_mode.ready_time;
          room.waiting_for_player_interval = setInterval((function() {
            wait_room_start_arena(ROOM_all[client.rid]);
          }), 1000);
        } else if (!room.waiting_for_player && room.waiting_for_player_interval) {
          clearInterval(room.waiting_for_player_interval);
          room.waiting_for_player_interval = null;
          room.waiting_for_player_time = settings.modules.arena_mode.ready_time;
        }
      } else {
        room.ready_player_count_without_host = 0;
        ref4 = room.players;
        for (p = 0, len5 = ref4.length; p < len5; p++) {
          player = ref4[p];
          if (player.pos === pos) {
            player.is_ready = is_ready;
          }
          if (!player.is_host) {
            room.ready_player_count_without_host += player.is_ready;
          }
        }
        if (room.ready_player_count_without_host >= room.max_player - 1) {
          //log.info "all ready"
          setTimeout((function() {
            wait_room_start(ROOM_all[client.rid], settings.modules.random_duel.ready_time);
          }), 1000);
        }
      }
    }
  });

  ygopro.ctos_follow('REQUEST_FIELD', true, function(buffer, info, client, server, datas) {
    return true;
  });

  ygopro.stoc_follow('FIELD_FINISH', true, function(buffer, info, client, server, datas) {
    var room;
    room = ROOM_all[client.rid];
    if (!(room && settings.modules.reconnect.enabled)) {
      return true;
    }
    client.reconnecting = false;
    if (client.time_confirm_required) { // client did not send TIME_CONFIRM
      client.waiting_for_last = true;
    } else if (client.last_game_msg && client.last_game_msg_title !== 'WAITING') { // client sent TIME_CONFIRM
      if (client.last_hint_msg) {
        ygopro.stoc_send(client, 'GAME_MSG', client.last_hint_msg);
      }
      ygopro.stoc_send(client, 'GAME_MSG', client.last_game_msg);
    }
    return true;
  });

  ygopro.stoc_follow('DUEL_END', false, function(buffer, info, client, server, datas) {
    var len4, len5, o, p, player, ref3, ref4, results, room;
    room = ROOM_all[client.rid];
    if (!(room && settings.modules.replay_delay && room.hostinfo.mode === 1)) {
      return;
    }
    SOCKET_flush_data(client, datas);
    CLIENT_send_replays(client, room);
    if (!room.replays_sent_to_watchers) {
      room.replays_sent_to_watchers = true;
      ref3 = room.players;
      for (o = 0, len4 = ref3.length; o < len4; o++) {
        player = ref3[o];
        if (player && player.pos > 3) {
          CLIENT_send_replays(player, room);
        }
      }
      ref4 = room.watchers;
      results = [];
      for (p = 0, len5 = ref4.length; p < len5; p++) {
        player = ref4[p];
        if (player) {
          results.push(CLIENT_send_replays(player, room));
        }
      }
      return results;
    }
  });

  wait_room_start = function(room, time) {
    var len4, o, player, ref3;
    if (room && room.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN && room.ready_player_count_without_host >= room.max_player - 1) {
      time -= 1;
      if (time) {
        if (!(time % 5)) {
          ygopro.stoc_send_chat_to_room(room, `${(time <= 9 ? ' ' : '')}${time}\${kick_count_down}`, time <= 9 ? ygopro.constants.COLORS.RED : ygopro.constants.COLORS.LIGHTBLUE);
        }
        setTimeout((function() {
          wait_room_start(room, time);
        }), 1000);
      } else {
        ref3 = room.players;
        for (o = 0, len4 = ref3.length; o < len4; o++) {
          player = ref3[o];
          if (player && player.is_host) {
            ROOM_ban_player(player.name, player.ip, "${random_ban_reason_zombie}");
            ygopro.stoc_send_chat_to_room(room, `${player.name} \${kicked_by_system}`, ygopro.constants.COLORS.RED);
            CLIENT_kick(player);
          }
        }
      }
    }
  };

  wait_room_start_arena = function(room) {
    var display_name, len4, o, player, ref3;
    if (room && room.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN && room.waiting_for_player) {
      room.waiting_for_player_time = room.waiting_for_player_time - 1;
      if (room.waiting_for_player_time > 0) {
        if (!(room.waiting_for_player_time % 5)) {
          ref3 = room.players;
          for (o = 0, len4 = ref3.length; o < len4; o++) {
            player = ref3[o];
            if (!(player)) {
              continue;
            }
            display_name = (settings.modules.hide_name && player !== room.waiting_for_player ? "********" : room.waiting_for_player.name);
            ygopro.stoc_send_chat(player, `${(room.waiting_for_player_time <= 9 ? ' ' : '')}${room.waiting_for_player_time}\${kick_count_down_arena_part1} ${display_name} \${kick_count_down_arena_part2}`, room.waiting_for_player_time <= 9 ? ygopro.constants.COLORS.RED : ygopro.constants.COLORS.LIGHTBLUE);
          }
        }
      } else {
        ygopro.stoc_send_chat_to_room(room, `${room.waiting_for_player.name} \${kicked_by_system}`, ygopro.constants.COLORS.RED);
        CLIENT_kick(room.waiting_for_player);
        if (room.waiting_for_player_interval) {
          clearInterval(room.waiting_for_player_interval);
          room.waiting_for_player_interval = null;
        }
      }
    }
  };

  //tip
  ygopro.stoc_send_random_tip = function(client) {
    var tip_type;
    tip_type = "tips";
    if (settings.modules.tips.split_zh && tips.tips_zh.length && client.lang === "zh-cn") {
      tip_type = "tips_zh";
    }
    if (settings.modules.tips.enabled && tips.tips.length && !client.is_local && !client.closed) {
      ygopro.stoc_send_chat(client, "Tip: " + tips[tip_type][Math.floor(Math.random() * tips[tip_type].length)]);
    }
  };

  ygopro.stoc_send_random_tip_to_room = function(room) {
    var len4, len5, o, p, player, ref3, ref4;
    if (settings.modules.tips.enabled && tips.tips.length) {
      ref3 = room.players;
      for (o = 0, len4 = ref3.length; o < len4; o++) {
        player = ref3[o];
        if (player && !player.is_local && !player.closed) {
          ygopro.stoc_send_random_tip(player);
        }
      }
      ref4 = room.watchers;
      for (p = 0, len5 = ref4.length; p < len5; p++) {
        player = ref4[p];
        if (player && !player.is_local && !player.closed) {
          ygopro.stoc_send_random_tip(player);
        }
      }
    }
  };

  load_tips = global.load_tips = function() {
    request({
      url: settings.modules.tips.get,
      json: true
    }, function(error, response, body) {
      if (_.isString(body)) {
        log.warn("tips bad json", body);
      } else if (error || !body) {
        log.warn('tips error', error, response);
      } else {
        setting_change(tips, "tips", body);
        log.info("tips loaded", tips.tips.length);
      }
    });
  };

  load_tips_zh = global.load_tips_zh = function() {
    request({
      url: settings.modules.tips.get_zh,
      json: true
    }, function(error, response, body) {
      if (_.isString(body)) {
        log.warn("zh tips bad json", body);
      } else if (error || !body) {
        log.warn('zh tips error', error, response);
      } else {
        setting_change(tips, "tips_zh", body);
        log.info("zh tips loaded", tips.tips_zh.length);
      }
    });
  };

  if (settings.modules.tips.get) {
    load_tips();
  }

  if (settings.modules.tips.get_zh) {
    load_tips_zh();
  }

  if (settings.modules.tips.enabled) {
    setInterval(function() {
      var len4, o, room;
      for (o = 0, len4 = ROOM_all.length; o < len4; o++) {
        room = ROOM_all[o];
        if (room && room.established) {
          if (room.duel_stage === ygopro.constants.DUEL_STAGE.SIDING || room.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN) {
            ygopro.stoc_send_random_tip_to_room(room);
          }
        }
      }
    }, 30000);
  }

  ygopro.stoc_follow('DUEL_START', false, function(buffer, info, client, server, datas) {
    var deck_arena, deck_name, deck_text, len4, len5, o, p, player, ref3, ref4, room;
    room = ROOM_all[client.rid];
    if (!(room && !client.reconnecting)) {
      return;
    }
    if (room.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN) { //first start
      room.duel_stage = ygopro.constants.DUEL_STAGE.FINGER;
      room.start_time = moment().format();
      room.turn = 0;
      if (!room.windbot && settings.modules.http.websocket_roomlist) {
        roomlist.start(room);
      }
      //room.duels = []
      room.dueling_players = [];
      ref3 = room.players;
      for (o = 0, len4 = ref3.length; o < len4; o++) {
        player = ref3[o];
        if (!(player.pos !== 7)) {
          continue;
        }
        room.dueling_players[player.pos] = player;
        room.scores[player.name_vpass] = 0;
        room.player_datas.push({
          key: CLIENT_get_authorize_key(player),
          name: player.name
        });
        if (room.random_type === 'T') {
          // 双打房不记录匹配过
          ROOM_players_oppentlist[player.ip] = null;
        }
      }
      if (room.hostinfo.auto_death) {
        ygopro.stoc_send_chat_to_room(room, `\${auto_death_part1}${room.hostinfo.auto_death}\${auto_death_part2}`, ygopro.constants.COLORS.BABYBLUE);
      }
    }
    if (settings.modules.hide_name && room.duel_count === 0) {
      ref4 = room.get_playing_player();
      for (p = 0, len5 = ref4.length; p < len5; p++) {
        player = ref4[p];
        if (player !== client) {
          ygopro.stoc_send(client, 'HS_PLAYER_ENTER', {
            name: player.name,
            pos: player.pos
          });
        }
      }
    }
    if (settings.modules.tips.enabled) {
      ygopro.stoc_send_random_tip(client);
    }
    deck_text = null;
    if (client.main && client.main.length) {
      deck_text = '#ygopro-server deck log\n#main\n' + client.main.join('\n') + '\n!side\n' + client.side.join('\n') + '\n';
      room.decks[client.name] = deck_text;
    }
    if (settings.modules.deck_log.enabled && deck_text && !client.deck_saved && !room.windbot) {
      deck_arena = settings.modules.deck_log.arena + '-';
      if (room.arena) {
        deck_arena = deck_arena + room.arena;
      } else if (room.hostinfo.mode === 2) {
        deck_arena = deck_arena + 'tag';
      } else if (room.random_type === 'S') {
        deck_arena = deck_arena + 'entertain';
      } else if (room.random_type === 'M') {
        deck_arena = deck_arena + 'athletic';
      } else {
        deck_arena = deck_arena + 'custom';
      }
      //log.info "DECK LOG START", client.name, room.arena
      if (settings.modules.deck_log.local) {
        deck_name = moment().format('YYYY-MM-DD HH-mm-ss') + ' ' + room.process_pid + ' ' + client.pos + ' ' + client.ip.slice(7) + ' ' + client.name.replace(/[\/\\\?\*]/g, '_');
        fs.writeFile(settings.modules.deck_log.local + deck_name + '.ydk', deck_text, 'utf-8', function(err) {
          if (err) {
            return log.warn('DECK SAVE ERROR', err);
          }
        });
      }
      if (settings.modules.deck_log.post) {
        request.post({
          url: settings.modules.deck_log.post,
          form: {
            accesskey: settings.modules.deck_log.accesskey,
            deck: deck_text,
            playername: client.name,
            arena: deck_arena
          }
        }, function(error, response, body) {
          if (error) {
            log.warn('DECK POST ERROR', error);
          } else {
            if (response.statusCode !== 200) {
              log.warn('DECK POST FAIL', response.statusCode, client.name, body);
            }
          }
        });
      }
      //else
      //log.info 'DECK POST OK', response.statusCode, client.name, body
      client.deck_saved = true;
    }
  });

  ygopro.ctos_follow('SURRENDER', true, function(buffer, info, client, server, datas) {
    var room, sur_player;
    room = ROOM_all[client.rid];
    if (!room) {
      return;
    }
    if (room.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN) {
      return true;
    }
    if (room.random_type && room.turn < 3 && !client.flee_free && !settings.modules.test_mode.surrender_anytime && !(room.random_type === 'M' && settings.modules.random_duel.record_match_scores)) {
      ygopro.stoc_send_chat(client, "${surrender_denied}", ygopro.constants.COLORS.BABYBLUE);
      return true;
    }
    if (room.hostinfo.mode === 2) {
      if (!settings.modules.tag_duel_surrender) {
        return true;
      } else if (!client.surrend_confirm && !CLIENT_get_partner(client).closed && !CLIENT_get_partner(client).is_local) {
        sur_player = CLIENT_get_partner(client);
        ygopro.stoc_send_chat(sur_player, "${surrender_confirm_tag}", ygopro.constants.COLORS.BABYBLUE);
        ygopro.stoc_send_chat(client, "${surrender_confirm_sent}", ygopro.constants.COLORS.BABYBLUE);
        sur_player.surrend_confirm = true;
        return true;
      }
    }
    return false;
  });

  report_to_big_brother = global.report_to_big_brother = function(roomname, sender, ip, level, content, match) {
    if (!settings.modules.big_brother.enabled) {
      return;
    }
    request.post({
      url: settings.modules.big_brother.post,
      form: {
        accesskey: settings.modules.big_brother.accesskey,
        roomname: roomname,
        sender: sender,
        ip: ip,
        level: level,
        content: content,
        match: match
      }
    }, function(error, response, body) {
      if (error) {
        log.warn('BIG BROTHER ERROR', error);
      } else {
        if (response.statusCode !== 200) {
          log.warn('BIG BROTHER FAIL', response.statusCode, roomname, body);
        }
      }
    });
  };

  //else
  //log.info 'BIG BROTHER OK', response.statusCode, roomname, body
  ygopro.ctos_follow('CHAT', true, function(buffer, info, client, server, datas) {
    var buy_result, cancel, ccolor, cip, cmd, cmsg, cname, color, cvalue, key, msg, name, oldmsg, ref3, room, struct, sur_player, uname, windbot, word;
    room = ROOM_all[client.rid];
    if (!room) {
      return;
    }
    msg = _.trim(info.msg);
    cancel = _.startsWith(msg, "/");
    if (!(cancel || !(room.random_type || room.arena) || room.duel_stage === ygopro.constants.DUEL_STAGE.FINGER || room.duel_stage === ygopro.constants.DUEL_STAGE.FIRSTGO || room.duel_stage === ygopro.constants.DUEL_STAGE.SIDING)) {
      room.last_active_time = moment();
    }
    cmd = msg.split(' ');
    switch (cmd[0]) {
      case '/投降':
      case '/surrender':
        if (room.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN || (room.hostinfo.mode === 2 && !settings.modules.tag_duel_surrender)) {
          return cancel;
        }
        if (room.random_type && room.turn < 3 && !client.flee_free) {
          ygopro.stoc_send_chat(client, "${surrender_denied}", ygopro.constants.COLORS.BABYBLUE);
          return cancel;
        }
        if (client.surrend_confirm) {
          ygopro.ctos_send(client.server, 'SURRENDER');
        } else {
          sur_player = CLIENT_get_partner(client);
          if (sur_player.closed || sur_player.is_local) {
            sur_player = client;
          }
          if (room.hostinfo.mode === 2 && sur_player !== client) {
            ygopro.stoc_send_chat(sur_player, "${surrender_confirm_tag}", ygopro.constants.COLORS.BABYBLUE);
            ygopro.stoc_send_chat(client, "${surrender_confirm_sent}", ygopro.constants.COLORS.BABYBLUE);
          } else {
            ygopro.stoc_send_chat(client, "${surrender_confirm}", ygopro.constants.COLORS.BABYBLUE);
          }
          sur_player.surrend_confirm = true;
        }
        break;
      case '/help':
        ygopro.stoc_send_chat(client, "${chat_order_main}");
        ygopro.stoc_send_chat(client, "${chat_order_help}");
        if (!settings.modules.mycard.enabled) {
          ygopro.stoc_send_chat(client, "${chat_order_roomname}");
        }
        if (settings.modules.windbot.enabled) {
          ygopro.stoc_send_chat(client, "${chat_order_windbot}");
        }
        if (settings.modules.tips.enabled) {
          ygopro.stoc_send_chat(client, "${chat_order_tip}");
        }
        if (settings.modules.chat_color.enabled && (!(settings.modules.vip.enabled && settings.modules.chat_color.restrict_to_vip) || client.vip)) {
          ygopro.stoc_send_chat(client, "${chat_order_chatcolor_1}");
        }
        if (settings.modules.chat_color.enabled && (!(settings.modules.vip.enabled && settings.modules.chat_color.restrict_to_vip) || client.vip)) {
          ygopro.stoc_send_chat(client, "${chat_order_chatcolor_2}");
        }
        if (settings.modules.vip.enabled) {
          ygopro.stoc_send_chat(client, "${chat_order_vip}");
        }
        break;
      case '/tip':
        if (settings.modules.tips.enabled) {
          ygopro.stoc_send_random_tip(client);
        }
        break;
      case '/ai':
        if (settings.modules.windbot.enabled && client.is_host && !settings.modules.challonge.enabled && !room.arena && room.random_type !== 'M') {
          if (name = cmd[1]) {
            windbot = _.sample(_.filter(windbots, function(w) {
              return w.name === name || w.deck === name;
            }));
            if (!windbot) {
              ygopro.stoc_send_chat(client, "${windbot_deck_not_found}", ygopro.constants.COLORS.RED);
              return;
            }
          } else {
            windbot = _.sample(windbots);
          }
          if (room.random_type) {
            ygopro.stoc_send_chat(client, "${windbot_disable_random_room} " + room.name, ygopro.constants.COLORS.BABYBLUE);
          }
          room.add_windbot(windbot);
        }
        break;
      case '/roomname':
        if (room) {
          ygopro.stoc_send_chat(client, "${room_name} " + room.name, ygopro.constants.COLORS.BABYBLUE);
        }
        break;
      case '/color':
        if (settings.modules.chat_color.enabled) {
          cip = CLIENT_get_authorize_key(client);
          if (settings.modules.vip.enabled && settings.modules.chat_color.restrict_to_vip && !client.vip) {
            CLIENT_send_vip_status(client);
          } else if (cmsg = cmd[1]) {
            if (cmsg.toLowerCase() === "help") {
              ygopro.stoc_send_chat(client, "${show_color_list}", ygopro.constants.COLORS.BABYBLUE);
              ref3 = ygopro.constants.COLORS;
              for (cname in ref3) {
                cvalue = ref3[cname];
                if (cvalue > 10) {
                  ygopro.stoc_send_chat(client, cname, cvalue);
                }
              }
            } else if (cmsg.toLowerCase() === "default") {
              if (settings.modules.vip.enabled && settings.modules.chat_color.restrict_to_vip) {
                delete vip_info.players[client.name].chat_color;
                setting_save(vip_info);
              } else {
                delete chat_color.save_list[cip];
              }
              setting_save(chat_color);
              ygopro.stoc_send_chat(client, "${set_chat_color_default}", ygopro.constants.COLORS.BABYBLUE);
            } else {
              ccolor = cmsg.toUpperCase();
              if (ygopro.constants.COLORS[ccolor] && ygopro.constants.COLORS[ccolor] > 10 && ygopro.constants.COLORS[ccolor] < 20) {
                if (settings.modules.vip.enabled && settings.modules.chat_color.restrict_to_vip) {
                  vip_info.players[client.name].chat_color = ccolor;
                  setting_save(vip_info);
                } else {
                  chat_color.save_list[cip] = ccolor;
                }
                setting_save(chat_color);
                ygopro.stoc_send_chat(client, "${set_chat_color_part1}" + ccolor + "${set_chat_color_part2}", ygopro.constants.COLORS.BABYBLUE);
              } else {
                ygopro.stoc_send_chat(client, "${color_not_found_part1}" + ccolor + "${color_not_found_part2}", ygopro.constants.COLORS.RED);
              }
            }
          } else {
            if (color = (settings.modules.vip.enabled && settings.modules.chat_color.restrict_to_vip ? vip_info.players[client.name].chat_color : chat_color.save_list[cip])) {
              ygopro.stoc_send_chat(client, "${get_chat_color_part1}" + color + "${get_chat_color_part2}", ygopro.constants.COLORS.BABYBLUE);
            } else {
              ygopro.stoc_send_chat(client, "${get_chat_color_default}", ygopro.constants.COLORS.BABYBLUE);
            }
          }
        }
        break;
      case '/vip':
        if (settings.modules.vip.enabled) {
          if (name = cmd[1]) {
            uname = name.toLowerCase();
            switch (uname) {
              case 'help':
                ygopro.stoc_send_chat(client, "${chat_order_vip_help}");
                ygopro.stoc_send_chat(client, "${chat_order_vip_status}");
                ygopro.stoc_send_chat(client, "${chat_order_vip_buy}");
                ygopro.stoc_send_chat(client, "${chat_order_vip_password}");
                ygopro.stoc_send_chat(client, "${chat_order_vip_dialogues}");
                ygopro.stoc_send_chat(client, "${chat_order_vip_words}");
                ygopro.stoc_send_chat(client, "${chat_order_vip_victory}");
                break;
              case 'status':
                CLIENT_send_vip_status(client, true);
                break;
              case 'buy':
                if (vip_info.players[client.name] && vip_info.players[client.name].password !== client.vpass) {
                  ygopro.stoc_send_chat(client, "${vip_account_existed}", ygopro.constants.COLORS.RED);
                } else if ((!client.vpass && client.name.length > 13) || (client.vpass && (client.name.length + client.vpass.length) > 18)) {
                  ygopro.stoc_send_chat(client, "${vip_player_name_too_long}", ygopro.constants.COLORS.RED);
                } else {
                  key = cmd[2];
                  buy_result = CLIENT_use_cdkey(client, key);
                  switch (buy_result) {
                    case 0:
                      ygopro.stoc_send_chat(client, "${vip_key_not_found}", ygopro.constants.COLORS.RED);
                      break;
                    case 1:
                      ygopro.stoc_send_chat(client, "${vip_success_new_part1}" + client.name + "$" + client.vpass + "${vip_success_new_part2}", ygopro.constants.COLORS.BABYBLUE);
                      break;
                    case 2:
                      ygopro.stoc_send_chat(client, "${vip_success_renew}", ygopro.constants.COLORS.BABYBLUE);
                  }
                }
                break;
              case 'dialogues':
                if (!client.vip) {
                  CLIENT_send_vip_status(client);
                } else {
                  code = cmd[2];
                  word = concat_name(cmd, 3);
                  if (!code || !parseInt(code)) {
                    ygopro.stoc_send_chat(client, "${vip_invalid_card_code}", ygopro.constants.COLORS.RED);
                  } else if (!word) {
                    delete vip_info.players[client.name].dialogues[parseInt(code)];
                    setting_save(vip_info);
                    ygopro.stoc_send_chat(client, "${vip_cleared_dialogues_part1}" + code + "${vip_cleared_dialogues_part2}", ygopro.constants.COLORS.BABYBLUE);
                  } else {
                    vip_info.players[client.name].dialogues[parseInt(code)] = word;
                    setting_save(vip_info);
                    ygopro.stoc_send_chat(client, "${vip_set_dialogues_part1}" + code + "${vip_set_dialogues_part2}", ygopro.constants.COLORS.BABYBLUE);
                  }
                }
                break;
              case 'words':
                if (!client.vip) {
                  CLIENT_send_vip_status(client);
                } else {
                  word = concat_name(cmd, 2);
                  if (!word) {
                    delete vip_info.players[client.name].words;
                    setting_save(vip_info);
                    ygopro.stoc_send_chat(client, "${vip_cleared_words}", ygopro.constants.COLORS.BABYBLUE);
                  } else {
                    vip_info.players[client.name].words = word;
                    setting_save(vip_info);
                    ygopro.stoc_send_chat(client, "${vip_set_words}", ygopro.constants.COLORS.BABYBLUE);
                  }
                }
                break;
              case 'victory':
                if (!client.vip) {
                  CLIENT_send_vip_status(client);
                } else {
                  word = concat_name(cmd, 2);
                  if (!word) {
                    delete vip_info.players[client.name].victory;
                    setting_save(vip_info);
                    ygopro.stoc_send_chat(client, "${vip_cleared_victory}", ygopro.constants.COLORS.BABYBLUE);
                  } else {
                    vip_info.players[client.name].victory = word;
                    setting_save(vip_info);
                    ygopro.stoc_send_chat(client, "${vip_set_victory}", ygopro.constants.COLORS.BABYBLUE);
                  }
                }
                break;
              case 'password':
                if (!client.vip) {
                  CLIENT_send_vip_status(client);
                } else {
                  word = cmd[2];
                  if (word && (client.name.length + word.length) <= 18) {
                    vip_info.players[client.name].password = word;
                    client.vpass = word;
                    setting_save(vip_info);
                    ygopro.stoc_send_chat(client, "${vip_password_changed}", ygopro.constants.COLORS.BABYBLUE);
                  }
                }
            }
          } else {
            CLIENT_send_vip_status(client);
          }
        }
    }
    //when '/test'
    //  ygopro.stoc_send_hint_card_to_room(room, 2333365)
    if (msg.length > 100) {
      log.warn("SPAM WORD", client.name, client.ip, msg);
      if (client.abuse_count) {
        client.abuse_count = client.abuse_count + 2;
      }
      ygopro.stoc_send_chat(client, "${chat_warn_level0}", ygopro.constants.COLORS.RED);
      cancel = true;
    }
    if (!(room && (room.random_type || room.arena))) {
      return cancel;
    }
    if (client.abuse_count >= 5 || CLIENT_is_banned_by_mc(client)) {
      log.warn("BANNED CHAT", client.name, client.ip, msg);
      ygopro.stoc_send_chat(client, "${banned_chat_tip}" + (client.ban_mc && client.ban_mc.message ? ": " + client.ban_mc.message : ""), ygopro.constants.COLORS.RED);
      return true;
    }
    oldmsg = msg;
    if (_.any(badwords.level3, function(badword) {
      var regexp;
      regexp = new RegExp(badword, 'i');
      return msg.match(regexp);
    }, msg)) {
      log.warn("BAD WORD LEVEL 3", client.name, client.ip, oldmsg, RegExp.$1);
      report_to_big_brother(room.name, client.name, client.ip, 3, oldmsg, RegExp.$1);
      cancel = true;
      if (client.abuse_count > 0) {
        ygopro.stoc_send_chat(client, "${banned_duel_tip}", ygopro.constants.COLORS.RED);
        ROOM_ban_player(client.name, client.ip, "${random_ban_reason_abuse}");
        ROOM_ban_player(client.name, client.ip, "${random_ban_reason_abuse}", 3);
        CLIENT_send_replays(client, room);
        CLIENT_kick(client);
        return true;
      } else {
        client.abuse_count = client.abuse_count + 4;
        ygopro.stoc_send_chat(client, "${chat_warn_level2}", ygopro.constants.COLORS.RED);
      }
    } else if (client.rag && room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN) {
      client.rag = false;
      //ygopro.stoc_send_chat(client, "${chat_warn_level0}", ygopro.constants.COLORS.RED)
      cancel = true;
    } else if (_.any(settings.ban.spam_word, function(badword) {
      var regexp;
      regexp = new RegExp(badword, 'i');
      return msg.match(regexp);
    }, msg)) {
      //log.warn "SPAM WORD", client.name, client.ip, oldmsg
      client.abuse_count = client.abuse_count + 2;
      ygopro.stoc_send_chat(client, "${chat_warn_level0}", ygopro.constants.COLORS.RED);
      cancel = true;
    } else if (_.any(badwords.level2, function(badword) {
      var regexp;
      regexp = new RegExp(badword, 'i');
      return msg.match(regexp);
    }, msg)) {
      log.warn("BAD WORD LEVEL 2", client.name, client.ip, oldmsg, RegExp.$1);
      report_to_big_brother(room.name, client.name, client.ip, 2, oldmsg, RegExp.$1);
      client.abuse_count = client.abuse_count + 3;
      ygopro.stoc_send_chat(client, "${chat_warn_level2}", ygopro.constants.COLORS.RED);
      cancel = true;
    } else {
      _.each(badwords.level1, function(badword) {
        var regexp;
        //log.info msg
        regexp = new RegExp(badword, "ig");
        msg = msg.replace(regexp, "**");
      }, msg);
      if (oldmsg !== msg) {
        log.warn("BAD WORD LEVEL 1", client.name, client.ip, oldmsg, RegExp.$1);
        report_to_big_brother(room.name, client.name, client.ip, 1, oldmsg, RegExp.$1);
        client.abuse_count = client.abuse_count + 1;
        ygopro.stoc_send_chat(client, "${chat_warn_level1}");
        struct = ygopro.structs["chat"];
        struct._setBuff(buffer);
        struct.set("msg", msg);
        buffer = struct.buffer;
      } else if (_.any(badwords.level0, function(badword) {
        var regexp;
        regexp = new RegExp(badword, 'i');
        return msg.match(regexp);
      }, msg)) {
        log.info("BAD WORD LEVEL 0", client.name, client.ip, oldmsg, RegExp.$1);
        report_to_big_brother(room.name, client.name, client.ip, 0, oldmsg, RegExp.$1);
      }
    }
    if (client.abuse_count >= 2) {
      ROOM_unwelcome(room, client, "${random_ban_reason_abuse}");
    }
    if (client.abuse_count >= 5) {
      ygopro.stoc_send_chat_to_room(room, `${client.name} \${chat_banned}`, ygopro.constants.COLORS.RED);
      ROOM_ban_player(client.name, client.ip, "${random_ban_reason_abuse}");
    }
    return cancel;
  });

  ygopro.ctos_follow('UPDATE_DECK', true, function(buffer, info, client, server, datas) {
    var current_deck, deck, deck_array, deck_main, deck_side, deck_text, deckbuf, decks, found_deck, i, len4, len5, line, o, oppo_pos, p, room, struct, win_pos;
    if (settings.modules.reconnect.enabled && client.pre_reconnecting) {
      if (!CLIENT_is_able_to_reconnect(client) && !CLIENT_is_able_to_kick_reconnect(client)) {
        ygopro.stoc_send_chat(client, "${reconnect_failed}", ygopro.constants.COLORS.RED);
        CLIENT_kick(client);
      } else if (CLIENT_is_able_to_reconnect(client, buffer)) {
        CLIENT_reconnect(client);
      } else if (CLIENT_is_able_to_kick_reconnect(client, buffer)) {
        CLIENT_kick_reconnect(client, buffer);
      } else {
        ygopro.stoc_send_chat(client, "${deck_incorrect_reconnect}", ygopro.constants.COLORS.RED);
        ygopro.stoc_send(client, 'ERROR_MSG', {
          msg: 2,
          code: 0
        });
        ygopro.stoc_send(client, 'HS_PLAYER_CHANGE', {
          status: (client.pos << 4) | 0xa
        });
      }
      return true;
    }
    room = ROOM_all[client.rid];
    if (!room) {
      return false;
    }
    //log.info info
    if (info.mainc > 256 || info.sidec > 256) { // Prevent attack, see https://github.com/Fluorohydride/ygopro/issues/2174
      CLIENT_kick(client);
      return true;
    }
    buff_main = (function() {
      var o, ref3, results;
      results = [];
      for (i = o = 0, ref3 = info.mainc; (0 <= ref3 ? o < ref3 : o > ref3); i = 0 <= ref3 ? ++o : --o) {
        results.push(info.deckbuf[i]);
      }
      return results;
    })();
    buff_side = (function() {
      var o, ref3, ref4, results;
      results = [];
      for (i = o = ref3 = info.mainc, ref4 = info.mainc + info.sidec; (ref3 <= ref4 ? o < ref4 : o > ref4); i = ref3 <= ref4 ? ++o : --o) {
        results.push(info.deckbuf[i]);
      }
      return results;
    })();
    client.main = buff_main;
    client.side = buff_side;
    if (room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN) {
      client.selected_preduel = true;
      if (client.side_tcount) {
        clearInterval(client.side_interval);
        client.side_interval = null;
        client.side_tcount = null;
      }
    } else {
      client.start_deckbuf = Buffer.from(buffer);
    }
    oppo_pos = room.hostinfo.mode === 2 ? 2 : 1;
    if (settings.modules.http.quick_death_rule >= 2 && room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN && room.death && room.scores[room.dueling_players[0].name_vpass] !== room.scores[room.dueling_players[oppo_pos].name_vpass]) {
      win_pos = room.scores[room.dueling_players[0].name_vpass] > room.scores[room.dueling_players[oppo_pos].name_vpass] ? 0 : oppo_pos;
      room.finished_by_death = true;
      ygopro.stoc_send_chat_to_room(room, "${death2_finish_part1}" + room.dueling_players[win_pos].name + "${death2_finish_part2}", ygopro.constants.COLORS.BABYBLUE);
      if (room.hostinfo.mode === 1) {
        CLIENT_send_replays(room.dueling_players[oppo_pos - win_pos], room);
      }
      ygopro.stoc_send(room.dueling_players[oppo_pos - win_pos], 'DUEL_END');
      if (room.hostinfo.mode === 2) {
        ygopro.stoc_send(room.dueling_players[oppo_pos - win_pos + 1], 'DUEL_END');
      }
      room.scores[room.dueling_players[oppo_pos - win_pos].name_vpass] = -1;
      CLIENT_kick(room.dueling_players[oppo_pos - win_pos]);
      if (room.hostinfo.mode === 2) {
        CLIENT_kick(room.dueling_players[oppo_pos - win_pos + 1]);
      }
      return true;
    }
    if (room.random_type || room.arena) {
      if (client.pos === 0) {
        room.waiting_for_player = room.waiting_for_player2;
      }
      room.last_active_time = moment();
    } else if (room.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN && settings.modules.tournament_mode.enabled && settings.modules.tournament_mode.deck_check && fs.readdirSync(settings.modules.tournament_mode.deck_path).length) {
      struct = ygopro.structs["deck"];
      struct._setBuff(buffer);
      struct.set("mainc", 1);
      struct.set("sidec", 1);
      struct.set("deckbuf", [4392470, 4392470]);
      buffer = struct.buffer;
      found_deck = false;
      decks = fs.readdirSync(settings.modules.tournament_mode.deck_path);
      for (o = 0, len4 = decks.length; o < len4; o++) {
        deck = decks[o];
        if (deck_name_match(deck, client.name)) {
          found_deck = deck;
        }
      }
      if (found_deck) {
        deck_text = fs.readFileSync(settings.modules.tournament_mode.deck_path + found_deck, {
          encoding: "ASCII"
        });
        deck_array = deck_text.split("\n");
        deck_main = [];
        deck_side = [];
        current_deck = deck_main;
        for (p = 0, len5 = deck_array.length; p < len5; p++) {
          line = deck_array[p];
          if (line.indexOf("!side") >= 0) {
            current_deck = deck_side;
          }
          card = parseInt(line);
          if (!isNaN(card)) {
            current_deck.push(card);
          }
        }
        if (_.isEqual(buff_main, deck_main) && _.isEqual(buff_side, deck_side)) {
          deckbuf = deck_main.concat(deck_side);
          struct.set("mainc", deck_main.length);
          struct.set("sidec", deck_side.length);
          struct.set("deckbuf", deckbuf);
          buffer = struct.buffer;
          //log.info("deck ok: " + client.name)
          ygopro.stoc_send_chat(client, `\${deck_correct_part1} ${found_deck} \${deck_correct_part2}`, ygopro.constants.COLORS.BABYBLUE);
        } else {
          //log.info("bad deck: " + client.name + " / " + buff_main + " / " + buff_side)
          ygopro.stoc_send_chat(client, `\${deck_incorrect_part1} ${found_deck} \${deck_incorrect_part2}`, ygopro.constants.COLORS.RED);
        }
      } else {
        //log.info("player deck not found: " + client.name)
        ygopro.stoc_send_chat(client, `${client.name}\${deck_not_found}`, ygopro.constants.COLORS.RED);
      }
    }
    return false;
  });

  ygopro.ctos_follow('RESPONSE', false, function(buffer, info, client, server, datas) {
    var room;
    room = ROOM_all[client.rid];
    if (!(room && (room.random_type || room.arena))) {
      return;
    }
    room.last_active_time = moment();
  });

  ygopro.stoc_follow('TIME_LIMIT', true, function(buffer, info, client, server, datas) {
    var check, cur_players, room;
    room = ROOM_all[client.rid];
    if (!room) {
      return;
    }
    if (settings.modules.reconnect.enabled) {
      if (client.closed) {
        ygopro.ctos_send(server, 'TIME_CONFIRM');
        return true;
      } else {
        client.time_confirm_required = true;
      }
    }
    if (!(settings.modules.heartbeat_detection.enabled && room.duel_stage === ygopro.constants.DUEL_STAGE.DUELING && !room.windbot)) {
      return;
    }
    check = false;
    if (room.hostinfo.mode !== 2) {
      check = (client.is_first && info.player === 0) || (!client.is_first && info.player === 1);
    } else {
      cur_players = [];
      switch (room.turn % 4) {
        case 1:
          cur_players[0] = 0;
          cur_players[1] = 3;
          break;
        case 2:
          cur_players[0] = 0;
          cur_players[1] = 2;
          break;
        case 3:
          cur_players[0] = 1;
          cur_players[1] = 2;
          break;
        case 0:
          cur_players[0] = 1;
          cur_players[1] = 3;
      }
      if (!room.dueling_players[0].is_first) {
        cur_players[0] = cur_players[0] + 2;
        cur_players[1] = cur_players[1] - 2;
      }
      check = client.pos === cur_players[info.player];
    }
    if (check) {
      CLIENT_heartbeat_register(client, false);
    }
    return false;
  });

  ygopro.ctos_follow('TIME_CONFIRM', false, function(buffer, info, client, server, datas) {
    var room;
    room = ROOM_all[client.rid];
    if (!room) {
      return;
    }
    if (settings.modules.reconnect.enabled) {
      if (client.waiting_for_last) {
        client.waiting_for_last = false;
        if (client.last_game_msg && client.last_game_msg_title !== 'WAITING') {
          if (client.last_hint_msg) {
            ygopro.stoc_send(client, 'GAME_MSG', client.last_hint_msg);
          }
          ygopro.stoc_send(client, 'GAME_MSG', client.last_game_msg);
        }
      }
      client.time_confirm_required = false;
    }
    if (settings.modules.heartbeat_detection.enabled) {
      client.heartbeat_protected = false;
      client.heartbeat_responsed = true;
      CLIENT_heartbeat_unregister(client);
    }
  });

  ygopro.ctos_follow('HAND_RESULT', false, function(buffer, info, client, server, datas) {
    var room;
    room = ROOM_all[client.rid];
    if (!room) {
      return;
    }
    client.selected_preduel = true;
    if (!(room.random_type || room.arena)) {
      return;
    }
    if (client.pos === 0) {
      room.waiting_for_player = room.waiting_for_player2;
    }
    room.last_active_time = moment().subtract(settings.modules.random_duel.hang_timeout - 19, 's');
  });

  ygopro.ctos_follow('TP_RESULT', false, function(buffer, info, client, server, datas) {
    var room;
    room = ROOM_all[client.rid];
    if (!room) {
      return;
    }
    client.selected_preduel = true;
    // room.selecting_tp = false
    if (!(room.random_type || room.arena)) {
      return;
    }
    room.last_active_time = moment();
  });

  ygopro.stoc_follow('CHAT', true, function(buffer, info, client, server, datas) {
    var len4, o, pid, player, ref3, room, tcolor, tplayer;
    room = ROOM_all[client.rid];
    pid = info.player;
    if (!(room && pid < 4 && settings.modules.chat_color.enabled && (!settings.modules.hide_name || room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN))) {
      return;
    }
    if (room.duel_stage === ygopro.constants.DUEL_STAGE.DUELING && !room.dueling_players[0].is_first) {
      if (room.hostinfo.mode === 2) {
        pid = {
          0: 2,
          1: 3,
          2: 0,
          3: 1
        }[pid];
      } else {
        pid = 1 - pid;
      }
    }
    ref3 = room.players;
    for (o = 0, len4 = ref3.length; o < len4; o++) {
      player = ref3[o];
      if (player && player.pos === pid) {
        tplayer = player;
      }
    }
    if (!(tplayer && (!(settings.modules.vip.enabled && settings.modules.chat_color.restrict_to_vip) || tplayer.vip))) {
      return;
    }
    tcolor = settings.modules.vip.enabled && settings.modules.chat_color.restrict_to_vip ? vip_info.players[tplayer.name].chat_color : chat_color.save_list[CLIENT_get_authorize_key(tplayer)];
    if (tcolor) {
      ygopro.stoc_send(client, 'CHAT', {
        player: ygopro.constants.COLORS[tcolor],
        msg: tplayer.name + ": " + info.msg
      });
      return true;
    }
  });

  ygopro.stoc_follow('SELECT_HAND', false, function(buffer, info, client, server, datas) {
    var room;
    room = ROOM_all[client.rid];
    if (!room) {
      return;
    }
    client.selected_preduel = false;
    if (client.pos === 0) {
      room.duel_stage = ygopro.constants.DUEL_STAGE.FINGER;
    }
    if (!(room.random_type || room.arena)) {
      return;
    }
    if (client.pos === 0) {
      room.waiting_for_player = client;
    } else {
      room.waiting_for_player2 = client;
    }
    room.last_active_time = moment().subtract(settings.modules.random_duel.hang_timeout - 19, 's');
  });

  ygopro.stoc_follow('SELECT_TP', false, function(buffer, info, client, server, datas) {
    var room;
    room = ROOM_all[client.rid];
    if (!room) {
      return;
    }
    client.selected_preduel = false;
    room.duel_stage = ygopro.constants.DUEL_STAGE.FIRSTGO;
    room.selecting_tp = client;
    if (room.random_type || room.arena) {
      room.waiting_for_player = client;
      room.last_active_time = moment();
    }
  });

  ygopro.stoc_follow('CHANGE_SIDE', false, function(buffer, info, client, server, datas) {
    var room, room_name, sinterval, temp_log;
    room = ROOM_all[client.rid];
    if (!room) {
      return;
    }
    if (client.pos === 0) {
      room.duel_stage = ygopro.constants.DUEL_STAGE.SIDING;
    }
    client.selected_preduel = false;
    if (settings.modules.side_timeout) {
      client.side_tcount = settings.modules.side_timeout;
      ygopro.stoc_send_chat(client, `\${side_timeout_part1}${settings.modules.side_timeout}\${side_timeout_part2}`, ygopro.constants.COLORS.BABYBLUE);
      sinterval = setInterval(function() {
        if (!(room && client && client.side_tcount && room.duel_stage === ygopro.constants.DUEL_STAGE.SIDING)) {
          clearInterval(sinterval);
          return;
        }
        if (client.side_tcount === 1) {
          ygopro.stoc_send_chat_to_room(room, client.name + "${side_overtime_room}", ygopro.constants.COLORS.BABYBLUE);
          ygopro.stoc_send_chat(client, "${side_overtime}", ygopro.constants.COLORS.RED);
          //room.scores[client.name_vpass] = -9
          CLIENT_send_replays(client, room);
          CLIENT_kick(client);
          return clearInterval(sinterval);
        } else {
          client.side_tcount = client.side_tcount - 1;
          return ygopro.stoc_send_chat(client, `\${side_remain_part1}${client.side_tcount}\${side_remain_part2}`, ygopro.constants.COLORS.BABYBLUE);
        }
      }, 60000);
      client.side_interval = sinterval;
    }
    if (settings.modules.challonge.enabled && settings.modules.challonge.post_score_midduel && room.hostinfo.mode !== 2 && client.pos === 0) {
      temp_log = JSON.parse(JSON.stringify(room.get_challonge_score()));
      delete temp_log.winnerId;
      room_name = room.name;
      challonge.matches._update({
        id: settings.modules.challonge.tournament_id,
        matchId: room.challonge_info.id,
        match: temp_log,
        callback: function(err, data) {
          if (err) {
            log.warn("Errored pushing scores to Challonge.", room_name, err);
          } else {
            refresh_challonge_cache();
          }
        }
      });
    }
    if (room.random_type || room.arena) {
      if (client.pos === 0) {
        room.waiting_for_player = client;
      } else {
        room.waiting_for_player2 = client;
      }
      room.last_active_time = moment();
    }
  });

  ygopro.stoc_follow('REPLAY', true, function(buffer, info, client, server, datas) {
    var duellog, dueltime, i, len4, len5, o, p, player, ref3, ref4, replay_filename, room;
    room = ROOM_all[client.rid];
    if (!room) {
      return settings.modules.tournament_mode.enabled && settings.modules.tournament_mode.replay_safe && settings.modules.tournament_mode.block_replay_to_player || settings.modules.replay_delay;
    }
    if (settings.modules.cloud_replay.enabled && room.random_type) {
      Cloud_replay_ids.push(room.cloud_replay_id);
    }
    if (!room.replays[room.duel_count - 1]) {
      // console.log("Replay saved: ", room.duel_count - 1, client.pos)
      room.replays[room.duel_count - 1] = buffer;
    }
    if (settings.modules.tournament_mode.enabled && settings.modules.tournament_mode.replay_safe) {
      if (client.pos === 0) {
        dueltime = moment().format('YYYY-MM-DD HH-mm-ss');
        replay_filename = dueltime;
        if (room.hostinfo.mode !== 2) {
          ref3 = room.dueling_players;
          for (i = o = 0, len4 = ref3.length; o < len4; i = ++o) {
            player = ref3[i];
            replay_filename = replay_filename + (i > 0 ? " VS " : " ") + player.name;
          }
        } else {
          ref4 = room.dueling_players;
          for (i = p = 0, len5 = ref4.length; p < len5; i = ++p) {
            player = ref4[i];
            replay_filename = replay_filename + (i > 0 ? (i === 2 ? " VS " : " & ") : " ") + player.name;
          }
        }
        replay_filename = replay_filename.replace(/[\/\\\?\*]/g, '_') + ".yrp";
        duellog = {
          time: dueltime,
          name: room.name + (settings.modules.tournament_mode.show_info ? " (Duel:" + room.duel_count + ")" : ""),
          roomid: room.process_pid.toString(),
          cloud_replay_id: "R#" + room.cloud_replay_id,
          replay_filename: replay_filename,
          roommode: room.hostinfo.mode,
          players: (function() {
            var len6, q, ref5, results;
            ref5 = room.dueling_players;
            results = [];
            for (q = 0, len6 = ref5.length; q < len6; q++) {
              player = ref5[q];
              results.push({
                name: player.name + (settings.modules.tournament_mode.show_ip && !player.is_local ? " (IP: " + player.ip.slice(7) + ")" : "") + (settings.modules.tournament_mode.show_info && !(room.hostinfo.mode === 2 && player.pos % 2 > 0) ? " (Score:" + room.scores[player.name_vpass] + " LP:" + (player.lp != null ? player.lp : room.hostinfo.start_lp) + (room.hostinfo.mode !== 2 ? " Cards:" + (player.card_count != null ? player.card_count : room.hostinfo.start_hand) : "") + ")" : ""),
                winner: player.pos === room.winner
              });
            }
            return results;
          })()
        };
        duel_log.duel_log.unshift(duellog);
        setting_save(duel_log);
        fs.writeFile(settings.modules.tournament_mode.replay_path + replay_filename, buffer, function(err) {
          if (err) {
            return log.warn("SAVE REPLAY ERROR", replay_filename, err);
          }
        });
      }
      if (settings.modules.cloud_replay.enabled) {
        ygopro.stoc_send_chat(client, `\${cloud_replay_delay_part1}R#${room.cloud_replay_id}\${cloud_replay_delay_part2}`, ygopro.constants.COLORS.BABYBLUE);
      }
      return settings.modules.tournament_mode.block_replay_to_player || settings.modules.replay_delay && room.hostinfo.mode === 1;
    } else {
      return settings.modules.replay_delay && room.hostinfo.mode === 1;
    }
  });

  if (settings.modules.random_duel.enabled) {
    setInterval(function() {
      var len4, o, room, time_passed;
      for (o = 0, len4 = ROOM_all.length; o < len4; o++) {
        room = ROOM_all[o];
        if (!(room && room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN && room.random_type && room.last_active_time && room.waiting_for_player && room.get_disconnected_count() === 0 && (!settings.modules.side_timeout || room.duel_stage !== ygopro.constants.DUEL_STAGE.SIDING))) {
          continue;
        }
        time_passed = Math.floor((moment() - room.last_active_time) / 1000);
        //log.info time_passed
        if (time_passed >= settings.modules.random_duel.hang_timeout) {
          room.last_active_time = moment();
          ROOM_ban_player(room.waiting_for_player.name, room.waiting_for_player.ip, "${random_ban_reason_AFK}");
          room.scores[room.waiting_for_player.name_vpass] = -9;
          //log.info room.waiting_for_player.name, room.scores[room.waiting_for_player.name_vpass]
          ygopro.stoc_send_chat_to_room(room, `${room.waiting_for_player.name} \${kicked_by_system}`, ygopro.constants.COLORS.RED);
          CLIENT_send_replays(room.waiting_for_player, room);
          CLIENT_kick(room.waiting_for_player);
        } else if (time_passed >= (settings.modules.random_duel.hang_timeout - 20) && !(time_passed % 10)) {
          ygopro.stoc_send_chat_to_room(room, `${room.waiting_for_player.name} \${afk_warn_part1}${settings.modules.random_duel.hang_timeout - time_passed}\${afk_warn_part2}`, ygopro.constants.COLORS.RED);
          ROOM_unwelcome(room, room.waiting_for_player, "${random_ban_reason_AFK}");
        }
      }
    }, 1000);
  }

  if (settings.modules.mycard.enabled) {
    setInterval(function() {
      var len4, len5, o, p, player, room, time_passed, waited_time;
      for (o = 0, len4 = ROOM_all.length; o < len4; o++) {
        room = ROOM_all[o];
        if (!(room && room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN && room.arena && room.last_active_time && room.waiting_for_player && room.get_disconnected_count() === 0 && (!settings.modules.side_timeout || room.duel_stage !== ygopro.constants.DUEL_STAGE.SIDING))) {
          continue;
        }
        time_passed = Math.floor((moment() - room.last_active_time) / 1000);
        //log.info time_passed
        if (time_passed >= settings.modules.random_duel.hang_timeout) {
          room.last_active_time = moment();
          ygopro.stoc_send_chat_to_room(room, `${room.waiting_for_player.name} \${kicked_by_system}`, ygopro.constants.COLORS.RED);
          room.scores[room.waiting_for_player.name_vpass] = -9;
          //log.info room.waiting_for_player.name, room.scores[room.waiting_for_player.name_vpass]
          CLIENT_send_replays(room.waiting_for_player, room);
          CLIENT_kick(room.waiting_for_player);
        } else if (time_passed >= (settings.modules.random_duel.hang_timeout - 20) && !(time_passed % 10)) {
          ygopro.stoc_send_chat_to_room(room, `${room.waiting_for_player.name} \${afk_warn_part1}${settings.modules.random_duel.hang_timeout - time_passed}\${afk_warn_part2}`, ygopro.constants.COLORS.RED);
        }
      }
      if (settings.modules.arena_mode.punish_quit_before_match) {
        for (p = 0, len5 = ROOM_all.length; p < len5; p++) {
          room = ROOM_all[p];
          if (!(room && room.arena && room.duel_stage === ygopro.constants.DUEL_STAGE.BEGIN && room.get_playing_player().length < 2)) {
            continue;
          }
          player = room.get_playing_player()[0];
          if (player && player.join_time && !player.arena_quit_free) {
            waited_time = moment() - player.join_time;
            if (waited_time >= 30000) {
              ygopro.stoc_send_chat(player, "${arena_wait_timeout}", ygopro.constants.COLORS.BABYBLUE);
              player.arena_quit_free = true;
            } else if (waited_time >= 5000 && waited_time < 6000) {
              ygopro.stoc_send_chat(player, "${arena_wait_hint}", ygopro.constants.COLORS.BABYBLUE);
            }
          }
        }
      }
    }, 1000);
  }

  if (settings.modules.heartbeat_detection.enabled) {
    setInterval(function() {
      var len4, len5, o, p, player, ref3, room;
      for (o = 0, len4 = ROOM_all.length; o < len4; o++) {
        room = ROOM_all[o];
        if (room && room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN && (room.hostinfo.time_limit === 0 || room.duel_stage !== ygopro.constants.DUEL_STAGE.DUELING) && !room.windbot) {
          ref3 = room.get_playing_player();
          for (p = 0, len5 = ref3.length; p < len5; p++) {
            player = ref3[p];
            if (player && (room.duel_stage !== ygopro.constants.DUEL_STAGE.SIDING || player.selected_preduel)) {
              CLIENT_heartbeat_register(player, true);
            }
          }
        }
      }
    }, settings.modules.heartbeat_detection.interval);
  }

  setInterval(function() {
    var current_time, len4, o, results, room;
    current_time = moment();
    results = [];
    for (o = 0, len4 = ROOM_all.length; o < len4; o++) {
      room = ROOM_all[o];
      if (!(room && room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN && room.hostinfo.auto_death && !room.auto_death_triggered && current_time - moment(room.start_time) > 60000 * room.hostinfo.auto_death)) {
        continue;
      }
      room.auto_death_triggered = true;
      results.push(room.start_death());
    }
    return results;
  }, 1000);

  // spawn windbot
  windbot_looplimit = 0;

  windbot_process = global.windbot_process = null;

  spawn_windbot = global.spawn_windbot = function() {
    var windbot_bin, windbot_parameters;
    if (/^win/.test(process.platform)) {
      windbot_bin = 'WindBot.exe';
      windbot_parameters = [];
    } else {
      windbot_bin = 'mono';
      windbot_parameters = ['WindBot.exe'];
    }
    windbot_parameters.push('ServerMode=true');
    windbot_parameters.push('ServerPort=' + settings.modules.windbot.port);
    windbot_process = spawn(windbot_bin, windbot_parameters, {
      cwd: 'windbot'
    });
    windbot_process.on('error', function(err) {
      log.warn('WindBot ERROR', err);
      if (windbot_looplimit < 1000 && !rebooted) {
        windbot_looplimit++;
        spawn_windbot();
      }
    });
    windbot_process.on('exit', function(code) {
      log.warn('WindBot EXIT', code);
      if (windbot_looplimit < 1000 && !rebooted) {
        windbot_looplimit++;
        spawn_windbot();
      }
    });
    windbot_process.stdout.setEncoding('utf8');
    windbot_process.stdout.on('data', function(data) {
      log.info('WindBot:', data);
    });
    windbot_process.stderr.setEncoding('utf8');
    windbot_process.stderr.on('data', function(data) {
      log.warn('WindBot Error:', data);
    });
  };

  if (settings.modules.windbot.enabled && settings.modules.windbot.spawn) {
    spawn_windbot();
  }

  rebooted = false;

  //http
  if (settings.modules.http) {
    addCallback = function(callback, text) {
      if (!callback) {
        return text;
      }
      return callback + "( " + text + " );";
    };
    requestListener = function(request, response) {
      var archive_args, archive_name, archive_process, check, death_room_found, duellog, error, filename, getpath, key, kick_room_found, len10, len4, len5, len6, len7, len8, len9, o, p, parseQueryString, pass_validated, player, q, r, ref3, ref4, replay, ret_keys, room, roomsjson, s, t, u, x;
      parseQueryString = true;
      u = url.parse(request.url, parseQueryString);
      //pass_validated = u.query.pass == settings.modules.http.password

      //console.log(u.query.username, u.query.pass)
      if (u.pathname === '/api/getrooms') {
        pass_validated = auth.auth(u.query.username, u.query.pass, "get_rooms", "get_rooms");
        if (!settings.modules.http.public_roomlist && !pass_validated) {
          response.writeHead(200);
          response.end(addCallback(u.query.callback, '{"rooms":[{"roomid":"0","roomname":"密码错误","needpass":"true"}]}'));
        } else {
          response.writeHead(200);
          roomsjson = JSON.stringify({
            rooms: (function() {
              var len4, o, results;
              results = [];
              for (o = 0, len4 = ROOM_all.length; o < len4; o++) {
                room = ROOM_all[o];
                if (room && room.established) {
                  results.push({
                    roomid: room.process_pid.toString(),
                    roomname: pass_validated ? room.name : room.name.split('$', 2)[0],
                    roommode: room.hostinfo.mode,
                    needpass: (room.name.indexOf('$') !== -1).toString(),
                    users: _.sortBy((function() {
                      var len5, p, ref3, results1;
                      ref3 = room.players;
                      results1 = [];
                      for (p = 0, len5 = ref3.length; p < len5; p++) {
                        player = ref3[p];
                        if (player.pos != null) {
                          results1.push({
                            id: (-1).toString(),
                            name: player.name,
                            ip: settings.modules.http.show_ip && pass_validated && !player.is_local ? player.ip.slice(7) : null,
                            status: settings.modules.http.show_info && room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN && player.pos !== 7 ? {
                              score: room.scores[player.name_vpass],
                              lp: player.lp != null ? player.lp : room.hostinfo.start_lp,
                              cards: room.hostinfo.mode !== 2 ? (player.card_count != null ? player.card_count : room.hostinfo.start_hand) : null
                            } : null,
                            pos: player.pos
                          });
                        }
                      }
                      return results1;
                    })(), "pos"),
                    istart: room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN ? (settings.modules.http.show_info ? "Duel:" + room.duel_count + " " + (room.duel_stage === ygopro.constants.DUEL_STAGE.SIDING ? "Siding" : "Turn:" + (room.turn != null ? room.turn : 0) + (room.death ? "/" + (room.death > 0 ? room.death - 1 : "Death") : "")) : 'start') : 'wait'
                  });
                }
              }
              return results;
            })()
          }, null, 2);
          response.end(addCallback(u.query.callback, roomsjson));
        }
      } else if (u.pathname === '/api/duellog' && settings.modules.tournament_mode.enabled) {
        if (!auth.auth(u.query.username, u.query.pass, "duel_log", "duel_log")) {
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "[{name:'密码错误'}]"));
          return;
        } else {
          response.writeHead(200);
          duellog = JSON.stringify(duel_log.duel_log, null, 2);
          response.end(addCallback(u.query.callback, duellog));
        }
      } else if (u.pathname === '/api/getkeys' && settings.modules.vip.enabled) {
        if (!auth.auth(u.query.username, u.query.pass, "vip", "get_keys")) {
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "Unauthorized."));
          return;
        } else if (!u.query.keytype || !vip_info.cdkeys[u.query.keytype]) {
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "Key type not found."));
          return;
        } else {
          response.writeHead(200);
          ret_keys = "";
          ref3 = vip_info.cdkeys[u.query.keytype];
          for (o = 0, len4 = ref3.length; o < len4; o++) {
            key = ref3[o];
            ret_keys = ret_keys + u.query.keytype + "D" + settings.port + ":" + key + "\n";
          }
          response.end(addCallback(u.query.callback, ret_keys));
        }
      } else if (u.pathname === '/api/archive.zip' && settings.modules.tournament_mode.enabled) {
        if (!auth.auth(u.query.username, u.query.pass, "download_replay", "download_replay_archive")) {
          response.writeHead(403);
          response.end("Invalid password.");
          return;
        } else {
          try {
            archive_name = moment().format('YYYY-MM-DD HH-mm-ss') + ".zip";
            archive_args = ["a", "-mx0", "-y", archive_name];
            check = false;
            ref4 = duel_log.duel_log;
            for (p = 0, len5 = ref4.length; p < len5; p++) {
              replay = ref4[p];
              check = true;
              archive_args.push(replay.replay_filename);
            }
            if (!check) {
              response.writeHead(403);
              response.end("Duel logs not found.");
              return;
            }
            archive_process = spawn(settings.modules.tournament_mode.replay_archive_tool, archive_args, {
              cwd: settings.modules.tournament_mode.replay_path
            });
            archive_process.on('error', (err) => {
              response.writeHead(403);
              response.end("Failed packing replays. " + err);
            });
            archive_process.on('exit', (code) => {
              return fs.readFile(settings.modules.tournament_mode.replay_path + archive_name, function(error, buffer) {
                if (error) {
                  response.writeHead(403);
                  response.end("Failed sending replays. " + error);
                } else {
                  response.writeHead(200, {
                    "Content-Type": "application/octet-stream",
                    "Content-Disposition": "attachment"
                  });
                  response.end(buffer);
                }
              });
            });
            archive_process.stdout.setEncoding('utf8');
            archive_process.stdout.on('data', (data) => {
              return log.info("archive process: " + data);
            });
            archive_process.stderr.setEncoding('utf8');
            archive_process.stderr.on('data', (data) => {
              return log.warn("archive error: " + data);
            });
          } catch (error1) {
            error = error1;
            response.writeHead(403);
            response.end("Failed reading replays. " + error);
          }
        }
      } else if (u.pathname === '/api/clearlog' && settings.modules.tournament_mode.enabled) {
        if (!auth.auth(u.query.username, u.query.pass, "clear_duel_log", "clear_duel_log")) {
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "[{name:'密码错误'}]"));
          return;
        } else {
          response.writeHead(200);
          if (settings.modules.tournament_mode.log_save_path) {
            fs.writeFile(settings.modules.tournament_mode.log_save_path + 'duel_log.' + moment().format('YYYY-MM-DD HH-mm-ss') + '.json', JSON.stringify(duel_log, null, 2), function(err) {
              if (err) {
                return log.warn('DUEL LOG SAVE ERROR', err);
              }
            });
          }
          duel_log.duel_log = [];
          setting_save(duel_log);
          response.end(addCallback(u.query.callback, "[{name:'Success'}]"));
        }
      } else if (_.startsWith(u.pathname, '/api/replay') && settings.modules.tournament_mode.enabled) {
        if (!auth.auth(u.query.username, u.query.pass, "download_replay", "download_replay")) {
          response.writeHead(403);
          response.end("密码错误");
          return;
        } else {
          getpath = null;
          filename = null;
          try {
            getpath = u.pathname.split("/");
            filename = path.basename(decodeURIComponent(getpath.pop()));
          } catch (error1) {
            response.writeHead(404);
            response.end("bad filename");
            return;
          }
          fs.readFile(settings.modules.tournament_mode.replay_path + filename, function(error, buffer) {
            if (error) {
              response.writeHead(404);
              response.end("未找到文件 " + filename);
            } else {
              response.writeHead(200, {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": "attachment"
              });
              response.end(buffer);
            }
          });
        }
      } else if (u.pathname === '/api/message') {
        //if !pass_validated
        //  response.writeHead(200)
        //  response.end(addCallback(u.query.callback, "['密码错误', 0]"))
        //  return
        if (u.query.shout) {
          if (!auth.auth(u.query.username, u.query.pass, "shout", "shout")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          for (q = 0, len6 = ROOM_all.length; q < len6; q++) {
            room = ROOM_all[q];
            if (room && room.established) {
              ygopro.stoc_send_chat_to_room(room, u.query.shout, ygopro.constants.COLORS.YELLOW);
            }
          }
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "['shout ok', '" + u.query.shout + "']"));
        } else if (u.query.stop) {
          if (!auth.auth(u.query.username, u.query.pass, "stop", "stop")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          if (u.query.stop === 'false') {
            u.query.stop = false;
          }
          setting_change(settings, 'modules:stop', u.query.stop);
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "['stop ok', '" + u.query.stop + "']"));
        } else if (u.query.welcome) {
          if (!auth.auth(u.query.username, u.query.pass, "change_settings", "change_welcome")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          setting_change(settings, 'modules:welcome', u.query.welcome);
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "['welcome ok', '" + u.query.welcome + "']"));
        } else if (u.query.getwelcome) {
          if (!auth.auth(u.query.username, u.query.pass, "change_settings", "get_welcome")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "['get ok', '" + settings.modules.welcome + "']"));
        } else if (u.query.loadtips) {
          if (!auth.auth(u.query.username, u.query.pass, "change_settings", "change_tips")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          load_tips();
          if (settings.modules.tips.get_zh) {
            load_tips_zh();
          }
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "['loading tip', '" + settings.modules.tips.get + (settings.modules.tips.get_zh ? " and " + settings.modules.tips.get_zh : "") + "']"));
        } else if (u.query.loaddialogues) {
          if (!auth.auth(u.query.username, u.query.pass, "change_settings", "change_dialogues")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          load_dialogues();
          if (settings.modules.dialogues.get_custom) {
            load_dialogues_custom();
          }
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "['loading dialogues', '" + settings.modules.dialogues.get + (settings.modules.dialogues.get_custom ? " and " + settings.modules.dialogues.get_custom : "") + "']"));
        } else if (u.query.loadwords) {
          load_words();
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "['loading words', '" + settings.modules.words.get + "']"));
        } else if (u.query.ban) {
          if (!auth.auth(u.query.username, u.query.pass, "ban_user", "ban_user")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          ban_user(u.query.ban);
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "['ban ok', '" + u.query.ban + "']"));
        } else if (u.query.kick) {
          if (!auth.auth(u.query.username, u.query.pass, "kick_user", "kick_user")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          kick_room_found = false;
          for (r = 0, len7 = ROOM_all.length; r < len7; r++) {
            room = ROOM_all[r];
            if (!(room && room.established && (u.query.kick === "all" || u.query.kick === room.process_pid.toString() || u.query.kick === room.name))) {
              continue;
            }
            kick_room_found = true;
            if (room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN) {
              room.scores[room.dueling_players[0].name_vpass] = 0;
              room.scores[room.dueling_players[1].name_vpass] = 0;
            }
            room.kicked = true;
            room.send_replays();
            room.process.kill();
            room.delete();
          }
          response.writeHead(200);
          if (kick_room_found) {
            response.end(addCallback(u.query.callback, "['kick ok', '" + u.query.kick + "']"));
          } else {
            response.end(addCallback(u.query.callback, "['room not found', '" + u.query.kick + "']"));
          }
        } else if (u.query.death) {
          if (!auth.auth(u.query.username, u.query.pass, "start_death", "start_death")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          death_room_found = false;
          for (s = 0, len8 = ROOM_all.length; s < len8; s++) {
            room = ROOM_all[s];
            if (room && (u.query.death === "all" || u.query.death === room.process_pid.toString() || u.query.death === room.name)) {
              if (room.start_death()) {
                death_room_found = true;
              }
            }
          }
          response.writeHead(200);
          if (death_room_found) {
            response.end(addCallback(u.query.callback, "['death ok', '" + u.query.death + "']"));
          } else {
            response.end(addCallback(u.query.callback, "['room not found', '" + u.query.death + "']"));
          }
        } else if (u.query.deathcancel) {
          if (!auth.auth(u.query.username, u.query.pass, "start_death", "cancel_death")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          death_room_found = false;
          for (t = 0, len9 = ROOM_all.length; t < len9; t++) {
            room = ROOM_all[t];
            if (room && (u.query.deathcancel === "all" || u.query.deathcancel === room.process_pid.toString() || u.query.deathcancel === room.name)) {
              if (room.cancel_death()) {
                death_room_found = true;
              }
            }
          }
          response.writeHead(200);
          if (death_room_found) {
            response.end(addCallback(u.query.callback, "['death cancel ok', '" + u.query.deathcancel + "']"));
          } else {
            response.end(addCallback(u.query.callback, "['room not found', '" + u.query.deathcancel + "']"));
          }
        } else if (u.query.reboot) {
          if (!auth.auth(u.query.username, u.query.pass, "stop", "reboot")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          for (x = 0, len10 = ROOM_all.length; x < len10; x++) {
            room = ROOM_all[x];
            if (!(room)) {
              continue;
            }
            if (room.duel_stage !== ygopro.constants.DUEL_STAGE.BEGIN) {
              room.scores[room.dueling_players[0].name_vpass] = 0;
              room.scores[room.dueling_players[1].name_vpass] = 0;
            }
            room.kicked = true;
            room.send_replays();
            room.process.kill();
            room.delete();
          }
          rebooted = true;
          if (windbot_process) {
            windbot_process.kill();
          }
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "['reboot ok', '" + u.query.reboot + "']"));
          throw "rebooted";
        } else if (u.query.generatekey && settings.modules.vip.enabled) {
          if (!auth.auth(u.query.username, u.query.pass, "vip", "generate_keys")) {
            response.writeHead(200);
            response.end(addCallback(u.query.callback, "['密码错误', 0]"));
            return;
          }
          VIP_generate_cdkeys(u.query.generatekey, settings.modules.vip.generate_count);
          response.writeHead(200);
          response.end(addCallback(u.query.callback, "['Keys generated', '" + u.query.generatekey + "']"));
        } else {
          response.writeHead(400);
          response.end();
        }
      } else {
        response.writeHead(400);
        response.end();
      }
    };
    http_server = http.createServer(requestListener);
    http_server.listen(settings.modules.http.port);
    if (settings.modules.http.ssl.enabled) {
      https = require('https');
      options = {
        cert: fs.readFileSync(settings.modules.http.ssl.cert),
        key: fs.readFileSync(settings.modules.http.ssl.key)
      };
      https_server = https.createServer(options, requestListener);
      if (settings.modules.http.websocket_roomlist && roomlist) {
        roomlist.init(https_server, ROOM_all);
      }
      https_server.listen(settings.modules.http.ssl.port);
    }
  }

  if (!fs.existsSync('./plugins')) {
    fs.mkdirSync('./plugins');
  }

  plugin_list = fs.readdirSync("./plugins");

  for (o = 0, len4 = plugin_list.length; o < len4; o++) {
    plugin_filename = plugin_list[o];
    plugin_path = process.cwd() + "/plugins/" + plugin_filename;
    require(plugin_path);
    log.info("Plugin loaded:", plugin_filename);
  }

}).call(this);


//# sourceMappingURL=ygopro-server.js.map
//# sourceURL=coffeescript