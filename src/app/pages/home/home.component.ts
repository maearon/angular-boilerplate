import { Component, OnInit, Inject, PLATFORM_ID } from "@angular/core"
import { CommonModule, isPlatformBrowser } from "@angular/common"
import { RouterModule } from "@angular/router"
import { FormsModule } from "@angular/forms"
import { Store } from "@ngrx/store"
import { ToastrService } from "ngx-toastr"
import { NgxPaginationModule } from "ngx-pagination"
import { Observable } from "rxjs"
import { User } from "../../models/user.model"
import { Micropost } from "../../models/micropost.model"
import { MicropostService } from "../../services/micropost.service"
import { selectLoggedIn, selectUser } from "../../store/session/session.selectors"

@Component({
  selector: "app-home",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgxPaginationModule],
  template: `
    <div *ngIf="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <ng-container *ngIf="!loading">
      <div *ngIf="loggedIn$ | async; else welcomePage" class="row">
        <aside class="col-md-4">
          <section class="user-info mb-4">
            <div class="d-flex align-items-center mb-3">
              <img
                class="gravatar rounded-circle me-3"
                [src]="'https://secure.gravatar.com/avatar/' + gravatar + '?s=50'"
                [alt]="(user$ | async)?.name"
                width="50"
                height="50"
              >
              <div>
                <h1 class="h5 mb-1">{{ (user$ | async)?.name }}</h1>
                <a [routerLink]="['/users', (user$ | async)?.id]">view my profile</a>
              </div>
            </div>
            <div>{{ micropostCount }} micropost{{ micropostCount !== 1 ? 's' : '' }}</div>
          </section>

          <section class="stats mb-4">
            <div class="d-flex justify-content-around">
              <div class="text-center">
                <a [routerLink]="['/users', (user$ | async)?.id, 'following']">
                  <strong class="d-block">{{ followingCount }}</strong>
                  following
                </a>
              </div>
              <div class="text-center">
                <a [routerLink]="['/users', (user$ | async)?.id, 'followers']">
                  <strong class="d-block">{{ followersCount }}</strong>
                  followers
                </a>
              </div>
            </div>
          </section>

          <section class="micropost-form">
            <form (ngSubmit)="handleSubmit()" #micropostForm="ngForm">
              <div *ngIf="errors.length" class="alert alert-danger">
                <ul class="mb-0">
                  <li *ngFor="let error of errors">{{ error }}</li>
                </ul>
              </div>

              <div class="form-group mb-3">
                <textarea
                  class="form-control"
                  placeholder="Compose new micropost..."
                  name="content"
                  id="micropost_content"
                  [(ngModel)]="content"
                  rows="3"
                ></textarea>
              </div>

              <div class="d-flex">
                <button
                  type="submit"
                  class="btn btn-primary me-2"
                  [disabled]="submitting"
                >
                  Post
                </button>

                <div class="form-group flex-grow-1">
                  <input
                    type="file"
                    class="form-control"
                    accept="image/jpeg,image/gif,image/png"
                    (change)="handleImageInput($event)"
                  >
                </div>
              </div>
            </form>
          </section>
        </aside>

        <div class="col-md-8">
          <h3 class="mb-4">Micropost Feed</h3>

          <div *ngIf="feedItems.length > 0; else noMicroposts">
            <ol class="list-unstyled">
              <li *ngFor="let item of feedItems | paginate: { itemsPerPage: 5, currentPage: page, totalItems: totalCount }"
                  [id]="'micropost-' + item.id"
                  class="media mb-4 d-flex">
                <a [routerLink]="['/users', item.user_id]" class="me-3">
                  <img
                    class="gravatar rounded-circle"
                    [src]="'https://secure.gravatar.com/avatar/' + item.gravatar_id + '?s=' + item.size"
                    [alt]="item.user_name"
                    [width]="item.size"
                    [height]="item.size"
                  >
                </a>
                <div class="media-body">
                  <div class="user mb-1">
                    <a [routerLink]="['/users', item.user_id]">{{ item.user_name }}</a>
                  </div>
                  <div class="content mb-2">
                    {{ item.content }}
                    <img *ngIf="item.image" [src]="item.image" alt="Post image" class="img-fluid mt-2">
                  </div>
                  <div class="timestamp text-muted small">
                    Posted {{ item.timestamp }} ago.
                    <!-- <a *ngIf="(user$ | async)?.id === item.user_id"
                       href="#"
                       (click)="removeMicropost($event, item.id)"
                       class="ms-2">
                      delete
                    </a> -->
                  </div>
                </div>
              </li>
            </ol>

            <pagination-controls
              (pageChange)="handlePageChange($event)"
              class="d-flex justify-content-center"
            ></pagination-controls>
          </div>

          <ng-template #noMicroposts>
            <div class="alert alert-info">No microposts yet.</div>
          </ng-template>
        </div>
      </div>

      <ng-template #welcomePage>
        <div class="text-center jumbotron bg-light p-5 rounded">
          <h1 class="display-4">Welcome to the Sample App</h1>
          <p class="lead">
            This is the home page for the
            <a href="https://angular.io/" target="_blank" rel="noopener noreferrer">Angular Tutorial</a>
            sample application.
          </p>
          <a routerLink="/signup" class="btn btn-lg btn-primary">Sign up now!</a>
        </div>
        <div class="text-center mt-4">
          <a href="https://angular.io/" target="_blank" rel="noopener noreferrer">
            <img src="/assets/images/angular.svg" alt="Angular logo" width="180" height="38">
          </a>
        </div>
      </ng-template>
    </ng-container>
  `,
  styles: [
    `
    .gravatar {
      border-radius: 50%;
    }
    .user-info {
      margin-bottom: 1rem;
    }
    .stats {
      margin-bottom: 1rem;
    }
    .micropost-form {
      margin-bottom: 2rem;
    }
    .media {
      margin-bottom: 1rem;
    }
  `,
  ],
})
export class HomeComponent implements OnInit {
  loading = true
  loggedIn$: Observable<boolean>
  user$: Observable<User | null>
  page = 1
  feedItems: Micropost[] = []
  totalCount = 0
  followingCount = 0
  followersCount = 0
  micropostCount = 0
  gravatar = ""
  content = ""
  image: File | null = null
  imageName = ""
  errors: string[] = []
  submitting = false

  constructor(
    private store: Store,
    private micropostService: MicropostService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.loggedIn$ = this.store.select(selectLoggedIn)
    this.user$ = this.store.select(selectUser)
  }

  ngOnInit(): void {
    this.checkAuthAndLoadFeed()
  }

  checkAuthAndLoadFeed(): void {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem("token")
      if (token) {
        this.loadFeed()
      } else {
        this.loading = false
      }
    } else {
      this.loading = false
    }
  }

  loadFeed(): void {
    this.micropostService.getAll({ page: this.page }).subscribe({
      next: (response) => {
        this.feedItems = response.feed_items
        this.totalCount = response.total_count
        this.followingCount = response.following
        this.followersCount = response.followers
        this.micropostCount = response.micropost
        this.gravatar = response.gravatar
        this.loading = false
      },
      error: (error) => {
        console.error("Error loading feed:", error)
        this.loading = false
      },
    })
  }

  handlePageChange(newPage: number): void {
    this.page = newPage
    this.loadFeed()
  }

  handleImageInput(event: Event): void {
    const input = event.target as HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0]
      const sizeInMB = file.size / 1024 / 1024

      if (sizeInMB > 512) {
        this.toastr.error("Maximum file size is 512MB. Please choose a smaller file.")
        this.image = null
        input.value = ""
      } else {
        this.image = file
        this.imageName = file.name
      }
    }
  }

  handleSubmit(): void {
    this.submitting = true
    this.errors = []

    const formData = new FormData()
    formData.append("micropost[content]", this.content)

    if (this.image) {
      formData.append("micropost[image]", this.image, this.imageName)
    }

    this.micropostService.create(formData).subscribe({
      next: (response) => {
        if (response.flash) {
          this.toastr.success(response.flash[1])
          this.content = ""
          this.image = null
          this.errors = []
          this.loadFeed()
        }

        if (response.error) {
          this.errors = response.error
        }

        this.submitting = false
      },
      error: (error) => {
        this.toastr.error("Failed to create micropost")
        this.submitting = false
      },
    })
  }

  removeMicropost(event: Event, micropostId: number): void {
    event.preventDefault()

    if (confirm("Are you sure?")) {
      this.micropostService.remove(micropostId).subscribe({
        next: (response) => {
          if (response.flash) {
            this.toastr.success(response.flash[1])
            this.loadFeed()
          }
        },
        error: (error) => {
          this.toastr.error("Failed to delete micropost")
        },
      })
    }
  }
}
