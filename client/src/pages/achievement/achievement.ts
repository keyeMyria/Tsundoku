import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import * as firebase from 'firebase/app';
import 'firebase/auth';

import { SkillService } from '../../app/services/skill.service';
import { Skill } from 'shared/entity';

@Component({
  selector: 'page-contact',
  templateUrl: 'achievement.html'
})
export class AchievementPage {
  skills: Skill[] = [];

  constructor(
    public navCtrl: NavController,
    private skillService: SkillService
  ) {}

  ionViewWillEnter() {
    this.skillService
      .getSkills(firebase.auth().currentUser.uid)
      .subscribe(skill => {
        if (
          this.skills.filter(
            item => item.created.toMillis() === skill.created.toMillis()
          ).length === 0
        )
          this.skills.push(skill);
      });
  }
}
