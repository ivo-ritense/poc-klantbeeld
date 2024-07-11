import {createOperation, z} from '../../generated/wundergraph.factory';
import {InternalOperationsClient} from "../../generated/wundergraph.internal.operations.client";
import {Datasource, Result} from "./models";
import {themas} from "./themas";

export default createOperation.query({
    input: z.object({
        themaId: z.string(),
        customerId: z.string().uuid()
    }),
    handler: async ({ operations, input }) => {

        const thema = themas.find(t => t.id === input.themaId);
        if (thema === undefined) {
            throw new Error('Thema not found');
        }

        const out: {
            thema: string;
            types: string[];
            data: any[];
        } = {
            thema: thema.id,
            types: thema.datasources.map(d => d.id),
            data: await resolveData(operations, input, thema.datasources)
        };
        return out;
    },
});

async function resolveData(
    operations: Omit<InternalOperationsClient, 'cancelSubscriptions'>,
    input: any,
    datasources: Datasource[]
) {
    const dependencyData: {[key: string]: any} = {}
    let resultData: any[] = []
    const resolvedDependencies: string[] = []

    return await resolveOperations(operations, input, datasources, resolvedDependencies, resultData, dependencyData)
}

async function resolveOperations(
    operations: Omit<InternalOperationsClient, 'cancelSubscriptions'>,
    input: any,
    datasources: Datasource[],
    resolvedDependencies: string[],
    resultData: any[],
    dependencyData: { [key: string]: any }
) {
    const promises: Promise<Result>[] = datasources.filter(
        d => d.dependencies.length > 0 ? d.dependencies.every(dep => resolvedDependencies.includes(dep)) : true
    ).map(async d => {
            return {
                datasource: d,
                operation: await operations.query({
                    operationName: d.operation,
                    input: d.inputs(input, dependencyData)
                })
            }
        }
    )

    const pass = await Promise.all(promises)
    pass.forEach(result => {
        resultData.push(result.operation.data)
        dependencyData[result.datasource.id] = result.operation.data
        resolvedDependencies.push(result.datasource.id)
    })
    datasources = datasources.filter(d => !resolvedDependencies.includes(d.id))

    if (datasources.length > 0) {
        await resolveOperations(operations, input, datasources, resolvedDependencies, resultData, dependencyData)
    }

    return resultData
}
