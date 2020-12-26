import { Injectable } from "@angular/core";

import { localStorage } from "@shared/utils/localStorage";
import { uuid } from "@shared/utils/uuid";
import { LOCAL_STORAGE_DEVICE_ID } from "@shared/constants";
import { Player } from "@shared/models/player";
import { Timer } from "@shared/models/timer";

@Injectable()
export class AnalyticsService {
  deviceId: string;

  constructor() {
    this.deviceId = localStorage.get<string>(LOCAL_STORAGE_DEVICE_ID);
    if (!this.deviceId) {
      this.deviceId = uuid.generate();
      localStorage.set(LOCAL_STORAGE_DEVICE_ID, this.deviceId);
    }
  }

  updateTimer(timer: Timer) {
    (<any>window).ga("send", "event", "timer", "type", timer.type);
  }

  updateLang(i18n: string) {
    (<any>window).ga("send", "event", "i18n", "set", i18n);
  }

  addPlayer(player: Player) {
    (<any>window).ga("send", "event", "player", "add", player.name);
  }

  deletePlayer() {
    (<any>window).ga("send", "event", "player", "delete");
  }

  addBase() {
    (<any>window).ga("send", "event", "base", "add");
  }

  deleteBase() {
    (<any>window).ga("send", "event", "base", "delete");
  }

  conquerBase() {
    (<any>window).ga("send", "event", "base", "conquer");
  }
}
