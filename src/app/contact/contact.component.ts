import { Component, OnInit } from '@angular/core';
import { Leader } from '../shared/leader';
import { LeaderService } from '../services/leader.service';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {

  leaders: Leader[];

  //selectedDish: Dish;


  constructor(private leaderService: LeaderService) { }

  ngOnInit() {
    this.leaders = this.leaderService.getLeaders();
  }


}
 