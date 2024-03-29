import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { IGameRecipe, IGameRefiningRecipe } from '../../../interfaces';
import { CharSelectState, WeavingState } from '../../../stores';

import { sortBy } from 'lodash';
import * as itemsData from '../../../assets/content/items.json';
import * as locationData from '../../../assets/content/weaving.json';
import { CancelWeavingJob, StartWeavingJob } from '../../../stores/weaving/weaving.actions';
import { ItemCreatorService } from '../../services/item-creator.service';

@Component({
  selector: 'app-weaving',
  templateUrl: './weaving.page.html',
  styleUrls: ['./weaving.page.scss'],
})
export class WeavingPage implements OnInit {

  public readonly locationData = (locationData as any).default || locationData;
  public readonly itemsData = (itemsData as any).default || itemsData;

  public amounts: Record<string, number> = {};

  @Select(WeavingState.level) level$!: Observable<number>;
  @Select(WeavingState.currentQueue) currentQueue$!: Observable<IGameRefiningRecipe[]>;

  @Select(CharSelectState.activeCharacterResources) resources$!: Observable<Record<string, number>>;

  constructor(private store: Store, private itemCreatorService: ItemCreatorService) { }

  ngOnInit() {
  }

  trackBy(index: number) {
    return index;
  }

  iconForRecipe(recipe: IGameRecipe) {
    return this.itemCreatorService.iconFor(recipe.result);
  }

  modifyAmount(recipe: IGameRecipe, amount: number) {
    this.amounts[recipe.result] = (this.amounts[recipe.result] || 1) + amount;
  }

  sortRecipes(recipes: IGameRecipe[]): IGameRecipe[] {
    return sortBy(recipes, 'result');
  }

  canCraftRecipe(resources: Record<string, number>, recipe: IGameRecipe, amount = 1): boolean {
    return Object.keys(recipe.ingredients).every(ingredient => resources[ingredient] >= (recipe.ingredients[ingredient] * amount));
  }

  craft(recipe: IGameRecipe, amount = 1) {
    this.amounts[recipe.result] = 1;

    this.store.dispatch(new StartWeavingJob(recipe, amount));
  }

  cancel(jobIndex: number) {
    this.store.dispatch(new CancelWeavingJob(jobIndex));
  }

}
