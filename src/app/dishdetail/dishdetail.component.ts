import { Component, OnInit, ViewChild, Inject  } from '@angular/core';
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
  errMess: string;
  dishIds: string[];
  prev: string;
  next: string;
  commentForm: FormGroup;
  commentf: Comment;
  dishcopy: Dish;

  @ViewChild('fform') feedbackFormDirective;

  
  formErrors = {
    'author': '',
    'comment': '',

  };
  validationMessages ={
    'author': {
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
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) { 
    this.createForm();
    }
  
    createForm() {
      this.commentForm = this.fb.group({
        author: ['',[ Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
        rating: 5,
        comment: ['',[ Validators.required, Validators.minLength(10)] ] 
      });
      this.commentForm.valueChanges
      .subscribe(data =>this.onValueChanged(data));

      this.onValueChanged();
    };  
    ngOnInit() {
      this.createForm();
  
      this.dishservice.getDishIds()
        .subscribe((dishIds) => this.dishIds = dishIds);
      this.route.params
        .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
        .subscribe(dish => {this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); },
        errmess => this.errMess = <any>errmess);
    }

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
      let currentDate = new Date().toISOString();
      this.commentf.date = currentDate;
      //console.log(this.commentf);
      this.dishcopy.comments.push(this.commentf);
      this.dishservice.putDish(this.dishcopy)
        .subscribe(dish => {
          this.dish = dish;
          this.dishcopy = dish;
        },
        errmess => {this.dish = null; this.dishcopy = null; this.errMess = <any>errmess});
      this.commentForm.reset({
        author: '',
        rating: 5,
        comment: '',
        date:''
      });
      this.feedbackFormDirective.resetForm();
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
