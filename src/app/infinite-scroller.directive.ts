import { Directive, AfterViewInit, ElementRef, Input, AfterViewChecked } from '@angular/core';

import { Observable } from 'rxjs/observable';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/exhaustMap';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/startWith';

interface ScrollPosition {
  sH: number;
  sT: number;
  cH: number;
}

const DEFAULT_SCROLL_POSITION: ScrollPosition = {
  sH: 0,
  sT: 0,
  cH: 0
};

@Directive({
  selector: '[appInfiniteScroller]'
})
export class InfiniteScrollerDirective implements AfterViewInit {

  private scrollEvent$;

  private userScrolledDown$;

  private requestStream$;

  private requestOnScroll$;

  private isInit = true;

  @Input()
  scrollCallback;

  @Input()
  immediateCallback;

  @Input()
  scrollPercent = 70;

  @Input()
  direction = 'DOWN';

  constructor(private elm: ElementRef) {
  }

  ngAfterViewInit() {

    this.registerScrollEvent();
    if (this.direction === 'UP') {
        this.streamScrollUpEvents();
    } else if (this.direction === 'DOWN') {
        this.streamScrollDownEvents();
    }

    this.requestCallbackOnScroll();

  }

  private registerScrollEvent() {

    this.scrollEvent$ = Observable.fromEvent(this.elm.nativeElement, 'scroll');

  }

  private streamScrollDownEvents() {
    this.userScrolledDown$ = this.scrollEvent$
      .map((e: any): ScrollPosition => ({
        sH: e.target.scrollHeight,
        sT: e.target.scrollTop,
        cH: e.target.clientHeight
      }))
      .pairwise()
      .filter(positions => this.isUserScrollingDown(positions) && this.isScrollDownExpectedPercent(positions[1]));
  }

  private streamScrollUpEvents() {
    this.userScrolledDown$ = this.scrollEvent$
      .map((e: any): ScrollPosition => ({
        sH: e.target.scrollHeight,
        sT: e.target.scrollTop,
        cH: e.target.clientHeight
      }))
      .pairwise()
      .filter(positions => this.isUserScrollingUp(positions) && this.isScrollUpExpectedPercent(positions[1]));
  }

  private requestCallbackOnScroll() {
    this.requestOnScroll$ = this.userScrolledDown$;

    if (this.immediateCallback) {
      this.elm.nativeElement.scrollTop = this.elm.nativeElement.scrollHeight;
      this.requestOnScroll$ = this.requestOnScroll$
        .startWith([DEFAULT_SCROLL_POSITION, DEFAULT_SCROLL_POSITION]);
    }

    this.requestOnScroll$
      .exhaustMap(() => {
        return this.scrollCallback();
      })
      .subscribe((data) => { console.log(data); }, (err) => console.log(err));

  }

  private isUserScrollingDown = (positions) => {
    return positions[0].sT < positions[1].sT;
  }
  private isUserScrollingUp = (positions) => {
    return positions[0].sT > positions[1].sT;
  }
  private isScrollDownExpectedPercent = (position) => {
    return (( position.cH + position.sT) / position.sH) > (this.scrollPercent / 100);
  }
  private isScrollUpExpectedPercent = (position) => {
    return (( position.sT) / position.sH) < 1 - (this.scrollPercent / 100);
  }

}
