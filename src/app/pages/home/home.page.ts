import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ICharacter } from '../../../interfaces';
import { CharSelectState } from '../../../stores';
import { DeleteCharacter } from '../../../stores/charselect/charselect.actions';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  @Select(CharSelectState.characters) characters$!: Observable<ICharacter[]>;

  constructor(
    private store: Store,
    private router: Router,
    private alertCtrl: AlertController
  ) { }

  ngOnInit() {
  }

  canMakeNewCharacter(characterList: ICharacter[]) {
    return characterList.length < 1;
  }

  playCharacter(slot: number) {
    this.router.navigate([`/game/${slot}/resources`]);
  }

  exportCharacter(slot: number) {
    this.store.selectOnce(data => data).subscribe(data => {
      const ignoredKeys: string[] = [];

      const charData = data.charselect.characters[slot];
      const charName = charData.name;

      const saveData = Object.keys(data).filter(key => !ignoredKeys.includes(key)).reduce((acc, key) => {
        acc[key] = data[key];
        return acc;
      }, {} as any);

      const fileName = `${charName}.qivan`;
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(saveData));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute('href',     dataStr);
      downloadAnchorNode.setAttribute('download', fileName);
      downloadAnchorNode.click();
    });
  }

  importCharacter(e: any, inputEl: HTMLInputElement) {
    if (!e || !e.target || !e.target.files) {
      return;
    }

    const file = e.target.files[0];

    const reader = new FileReader();
    reader.onload = (ev) => {
      const charFile = JSON.parse((ev.target as FileReader).result as string);

      const finish = () => {
        inputEl.value = '';
      };

      this.store.reset(charFile);
      finish();
    };

    reader.readAsText(file);
  }

  async deleteCharacter(slot: number) {
    const alert = await this.alertCtrl.create({
      header: 'Delete Character',
      message: 'Are you sure you want to delete this character?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.store.dispatch(new DeleteCharacter(slot));
          }
        }
      ]
    });

    await alert.present();
  }

}
