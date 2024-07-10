import {Thema} from "./models";
import {datasources} from "./datasources";

export const themas: Thema[] = [
    {
        id: 'customer',
        datasources: [datasources.klant]
    },
    {
        id: 'persoon',
        datasources: [datasources.klant, datasources.persoon]
    },
    {
        id: 'all',
        datasources: [datasources.klant, datasources.persoon, datasources.voertuig]
    }
]
