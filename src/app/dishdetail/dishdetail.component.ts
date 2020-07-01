import { Component, OnInit, ViewChild  } from '@angular/core';
import { Dish } from '../shared/dish';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { DishService } from '../services/dish.service';
import { switchMap } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Comment } from '../shared/comment';
@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
   
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  commentf: Comment;

  @ViewChild('fform') feedbackFormDirective;

  formErrors = {
    'name': '',
    'comment': '',

  };
  validationMessages ={
    'name': {
      'required':      'Name is required.',
      'minlength':     'Name must be at least 2 characters long.',
      'maxlength':     'Name cannot be more than 25 characters long.'
    },
    'comment': {
      'required':      'Comment is required.',
      'minlength':     'Comment must be at least 10 characters long.',
    }
  };
  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) { 
    this.createForm();
    }
  
    createForm() {
      this.commentForm = this.fb.group({
        name: ['',[ Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
        rating: 5,
        comment: ['',[ Validators.required, Validators.minLength(10)] ] 
        ,date: ['']
      });
      this.commentForm.valueChanges
      .subscribe(data =>this.onValueChanged(data));

      this.onValueChanged();
    };      
    onValueChanged(data?: any) {
      if (!this.commentForm) { return; }
      const form = this.commentForm;
      
      for (const field in this.formErrors) {
        if (this.formErrors.hasOwnProperty(field)) {
          // clear previous error message (if any)
          this.formErrors[field] = '';
          const control = form.get(field);
          if (control && control.dirty && !control.valid) {
            const messages = this.validationMessages[field];
            for (const key in control.errors) {
              if (control.errors.hasOwnProperty(key)) {
                this.formErrors[field] += messages[key] + ' ';
              }
            }
          }
        }
      }
    }
    
  
    onSubmit() {
      this.commentf = this.commentForm.value;
      console.log(this.commentf);
      const months = ["JAN", "FEB", "MAR","APR", "MAY", "JUN", "Jul", "AUG", "SEP", "OCT", "NOV", "DEC"];
      let current_datetime = new Date();
      let formatted_date = " " + months[current_datetime.getMonth()] + " " + current_datetime.getDate() + ", " + current_datetime.getFullYear();
      document.getElementById("demo").innerHTML = this.commentForm.value.comment;
      document.getElementById("demo1").innerHTML = this.commentForm.value.rating + ' stars';
      document.getElementById("demo2").innerHTML = '--' + this.commentForm.value.name + formatted_date;
      this.commentForm.reset({
        name: '',
        rating: 5,
        comment: '',
        date:''
      });
      this.feedbackFormDirective.resetForm();
    }
  
  ngOnInit() {
    this.dishservice.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
    this.route.params
      .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => {this.dish = dish; this.setPrevNext(dish.id); });
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }
 
}
