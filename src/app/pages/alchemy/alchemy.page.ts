import { Component, OnInit } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { IGameRecipe, IGameRefiningRecipe } from '../../../interfaces';
import { AlchemyState, CharSelectState } from '../../../stores';

import { sortBy } from 'lodash';
import * as locationData from '../../../assets/content/alchemy.json';
import * as itemsData from '../../../assets/content/items.json';
import { CancelAlchemyJob, StartAlchemyJob } from '../../../stores/alchemy/alchemy.actions';
import { ItemCreatorService } from '../../services/item-creator.service';

@Component({
  selector: 'app-alchemy',
  templateUrl: './alchemy.page.html',
  styleUrls: ['./alchemy.page.scss'],
})
export class AlchemyPage implements OnInit {

  public readonly locationData = (locationData as any).default || locationData;
  public readonly itemsData = (itemsData as any).default || itemsData;

  public amounts: Record<string, number> = {};

  @Select(AlchemyState.level) level$!: Observable<number>;
  @Select(AlchemyState.currentQueue) currentQueue$!: Observable<IGameRefiningRecipe[]>;

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

    this.store.dispatch(new StartAlchemyJob(recipe, amount));
  }

  cancel(jobIndex: number) {
    this.store.dispatch(new CancelAlchemyJob(jobIndex));
  }

}
