import { Component, OnInit } from '@angular/core';
import { MsalService } from '@azure/msal-angular';
import { UsersService } from '../../services/user.service';
import { forkJoin, switchMap } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  imports: [CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit {
  user: any = null;
  userPhoto: string | null = null;
  userInitials: string = '';
  constructor(private msalService: MsalService, private usersService: UsersService, private http: HttpClient) {
    
  }
ngOnInit(): void {
  this.msalService.acquireTokenSilent({
    scopes: ['User.Read', 'User.Read.All']
  })
  .pipe(
    switchMap(result => {
      const accessToken = result.accessToken;
      const body = { token: accessToken };
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

      return forkJoin({
        profile: this.http.post<any>('http://localhost:3000/users', body, { headers }),
        photo: this.http.post<any>('http://localhost:3000/users/photo', body, { headers })
      });
    })
  )
  .subscribe(
    ({ profile, photo }) => {
      this.user = profile;
      this.userPhoto = photo?.image || null;

      // Generate initials if photo is missing
      if (!this.userPhoto && this.user) {
        const fyllName = this.user.displayName?.charAt(0) || '';
        const last = this.user.surname?.charAt(0) || '';
        this.userInitials = `${fyllName}${last}`.toUpperCase();
        console.log('this.userInitials',this.userInitials)
      }
    },
    error => {
      console.error('Error fetching user data or photo:', error);
    }
  );
}


}
