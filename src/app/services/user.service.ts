import { Injectable } from "@angular/core";
import { ApiService } from "./api.service";
import { ApiCallOptions } from '../interfaces/ApiCallOptions.interface';
import { HttpMethod } from "../interfaces/httpMethod.interface";


@Injectable({ providedIn: 'root' })
export class UsersService {
    /**
     *
     */
    constructor(private apiService: ApiService) {

    }

    getUser(options: ApiCallOptions) {
       return this.apiService.call(options);
    }
}
