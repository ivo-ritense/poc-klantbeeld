import {Datasource} from "./models";

export const datasources: {[key: string]: Datasource} = {
    klant: {
        id: 'klant',
        operation: 'CustomerInternal',
        inputs: (inputs) => ({
            customerId: inputs.customerId
        }),
        dependencies: []
    },
    persoon: {
        id: 'persoon',
        operation: 'PersoonInternal',
        inputs: (inputs, dependencyData) => ({
            bsn: dependencyData.klant.klant.bsn
        }),
        dependencies: ['klant']
    },
    voertuig: {
        id: 'voertuig',
        operation: 'VoertuigInternal',
        inputs: (inputs, dependencyData) => ({
            bsn: dependencyData.klant.klant.bsn
        }),
        dependencies: ['klant', 'persoon']
    }
}
