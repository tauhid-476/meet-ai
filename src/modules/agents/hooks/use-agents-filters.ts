
import { DEFAULT_PAGE } from "@/constants"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"


export const useAgentsFilters = () => {
    return useQueryStates({
        search: parseAsString.withDefault("").withOptions({ clearOnDefault: true }),
        page: parseAsInteger.withDefault(DEFAULT_PAGE).withOptions({ clearOnDefault: true }),
    })
}

//localhost:3000?search=hello&page=2
// 🚫  localhost:3000?search=hello&pageSize=10000000000 
//  this breaks the app because it exceeds the max page size