import {Queries} from "../../generated/wundergraph.internal.operations.client";

export interface Thema {
    id: string
    datasources: Datasource[]
}

export interface Datasource {
    id: string
    operation: keyof Queries
    inputs: (inputs: any, dependencyData: any) => any
    dependencies: string[]
}

export interface Result {
    datasource: Datasource
    operation: any
}
