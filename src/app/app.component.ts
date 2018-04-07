import {Component, NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'
import { HttpModule } from '@angular/http';
import { HackerNewsService } from './hackernews.service'
import { InfiniteScrollerDirective } from './infinite-scroller.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '';

  currentPage: number = 1;
  doScrollDown: boolean;
  news: Array<any> = [];

  scrollCallback;

  constructor(private hackerNewsSerivce: HackerNewsService) {
    this.title = 'Hacker News List (Scroll UP)';
    this.scrollCallback = this.getStories.bind(this);

   }

  getStories() {
    return this.hackerNewsSerivce.getLatestStories(this.currentPage).do(this.processData);
  }

  private processData = (news) => {
    this.currentPage++;
    if (this.news.length === 0) {
      this.news = news.json();
      this.doScrollDown = true;

    } else {
      this.news = news.json().concat(this.news);
      this.doScrollDown = false;
    }
  }
}
