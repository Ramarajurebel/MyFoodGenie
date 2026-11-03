import { EventItems } from './event-items';
export interface Events {
    keventid?: number;
    keventname?: string;
    platterscount?: number;
    totalitems?: number;
    totalcost?: number;
    status?: string;
    eventdate?: string;
    assdto?: string;
    createddatetime?: any;
    updateddatetime?: any;
    category?: string;
    seq?: number;
    type?: string;
    starttime?: any;
    stallid?: number;
    stallname?: string;
    instructions?: string;
    eventItems?: EventItems[];
    childActive?: boolean;
    isEdit?: boolean;
}
