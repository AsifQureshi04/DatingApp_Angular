import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { removeAllAppScopedEventListeners } from '@angular/core/primitives/event-dispatch';
import { PaginatedResult } from '../Models/pagination';
import { Member } from '../Models/member';
import { setPaginatedResponse, setPaginationHeaders } from './paginationHelper';
import { PresenceService } from './presence.service';
import { HubConnectionState } from '@microsoft/signalr';

@Injectable({
  providedIn: 'root'
})
export class LikesService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  likeIds = signal<number[]>([]);
  private presenceService = inject(PresenceService);
  
  paginatedResult = signal<PaginatedResult<Member[]> | null>(null);

  toggleLike(targetId : number){
    // return this.http.post(`${this.baseUrl}Likes/${targetId}`,{});
    if(this.presenceService.hubConnection?.state === HubConnectionState.Connected){
      this.presenceService.hubConnection.invoke('ToogleLike',this.presenceService.hubConnection.connectionId,targetId)
                                        .then(success => console.log('successfully liked user'))
                                        .catch(error => console.log('Error while liking user',error))
    }else{
      console.error('Hub connection is not established. Please reconnect.');
    }
  }

  getLikes(predicate :string, pageNumber:number, pageSize: number){
    let params = setPaginationHeaders(pageNumber,pageSize)
    params = params.append('predicate',predicate)
    return this.http.get<any>(`${this.baseUrl}Likes/GetAllLikedOrLikedByUsers`,
          {observe:'response',params}).subscribe({
            next : response => setPaginatedResponse(response,this.paginatedResult)
          });
  }

  getLikeIds(){
    return this.http.post<any>(`${this.baseUrl}Likes/list`,{}).subscribe({
      next : response => {
        const ids = response.data.map((item: { ids: number }) => item.ids);
        this.likeIds.set(ids);
      } 
    })
  }
}
