import VueRouter, { Route } from 'vue-router'
import axios from 'axios'
import { IResult, IGetResult, IFilter } from '@picgo/store/dist/types'

interface IGalleryDB {
  get<T>(filter?: IFilter): Promise<IGetResult<T>>
  insert<T> (value: T): Promise<IResult<T>>
  insertMany<T> (value: T[]): Promise<IResult<T>[]>
  getById<T> (id: string): Promise<IResult<T> | undefined>
  removeById (id: string): Promise<void>
}

declare module 'vue/types/vue' {
  interface Vue {
    $router: VueRouter,
    $route: Route,
    $http: typeof axios
    $bus: Vue
    $$db: IGalleryDB
    saveConfig(data: IObj | string, value?: any): void
    getConfig<T>(key?: string): Promise<T | undefined>
  }
}
