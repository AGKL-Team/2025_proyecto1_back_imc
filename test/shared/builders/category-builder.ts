import { Category } from '../../../src/module/imc/domain/models/category';

export class CategoryBuilder {
  private readonly category: Category;

  constructor() {
    this.category = new Category();
    this.category.id = 1;
    this.category.name = 'Normal';
    this.category.min = 18.51;
    this.category.max = 25;
  }

  withId(id: number): CategoryBuilder {
    this.category.id = id;
    return this;
  }

  withName(name: string): CategoryBuilder {
    this.category.name = name;
    return this;
  }

  withMin(min: number): CategoryBuilder {
    this.category.min = min;
    return this;
  }

  withMax(max: number): CategoryBuilder {
    this.category.max = max;
    return this;
  }

  build(): Category {
    return this.category;
  }
}
