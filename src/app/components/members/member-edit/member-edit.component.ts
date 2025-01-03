import { Component, HostListener, inject, OnInit, ViewChild } from '@angular/core';
import { Member } from '../../../Models/member';
import { AccountService } from '../../../services/account.service';
import { MembersService } from '../../../services/members.service';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { GalleryModule } from 'ng-gallery';
import { FormsModule, NgForm } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PhotoEditorComponent } from "../photo-editor/photo-editor.component";
import { Photo } from '../../../Models/photo';
import { TimeagoModule } from 'ngx-timeago';

@Component({
  selector: 'app-member-edit',
  standalone: true,
  imports: [CommonModule, TabsModule, GalleryModule, FormsModule, PhotoEditorComponent,TimeagoModule],
  templateUrl: './member-edit.component.html',
  styleUrl: './member-edit.component.scss'
})
export class MemberEditComponent implements OnInit {
  @ViewChild('editForm') editForm? : NgForm

  //  This is how we can access browser events from angular component
  @HostListener('window:beforeunload',['$event']) notify($event:any){
      if(this.editForm?.dirty){
        $event.returnValue = true;
      }
  }
      
  member?:Member;
  private accountService = inject(AccountService)
  private memberService = inject(MembersService)
  private toastr = inject(ToastrService)
  response!: any;

  ngOnInit(){
      this.loadMember();
  }

  loadMember(){
    const user = this.accountService.currentUser();
    if(!user) {
      console.log(user)
      return
    }
    this.memberService.getMember(user.data.userName!).subscribe({
      next:member =>{
        this.member = member;
        if(member.body.data[0]) 
          this.member = member.body.data[0]
      }
    })
  }
  
  UpdateMember(){
    this.memberService.updateMember(this.editForm?.value).subscribe({
      next: (_:any) =>{
        this.toastr.success("Profile updated successfully");
        this.editForm?.reset(this.member)
      }
    })
  }
  
  onMemberChange(event : Member){
    this.member = event;

  }


}
