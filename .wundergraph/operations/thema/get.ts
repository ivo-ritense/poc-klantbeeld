import {createOperation, z} from '../../generated/wundergraph.factory';
import {InternalOperationsClient} from "../../generated/wundergraph.internal.operations.client";
import {Datasource} from "./models";
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
    const resultData: any[] = []

    interface Result {
        datasource: Datasource
        operation: any
    }

    const promises: Promise<Result>[] = datasources.filter(
        d => d.dependencies === undefined
    ).map( async d =>
         {
            return {
                datasource: d,
                operation: await operations.query({
                    operationName: d.operation,
                    input: d.inputs(input, dependencyData)
                })
            }
        }
    )
    const firstPass = await Promise.all(promises)
    firstPass.forEach(result => {
        resultData.push(result.operation.data)
        dependencyData[result.datasource.id] = result.operation.data
    })

    const promisesWithDependency = datasources.filter(
        d => d.dependencies !== undefined
    ).map(d =>
        operations.query({
            operationName: d.operation,
            input: d.inputs(input, dependencyData)
        })
    )
    const secondPass = await Promise.all(promisesWithDependency)
    secondPass.forEach(result => {
        resultData.push(result.data)
    })

    return resultData
}
