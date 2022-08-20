import { Component, OnInit, OnDestroy } from '@angular/core';
import { CilpService } from '../services/cilp.service';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css']
})
export class ClipsListComponent implements OnInit, OnDestroy {

  constructor(
    public clipService: CilpService
  ) {

    this.clipService.getClips()
    // console.log(this.clipService.getClips());

    // console.log("=============")
  }

  ngOnInit(): void {
    window.addEventListener('scroll', this.handleScroll)
  }

  ngOnDestroy(): void {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement
    const { innerHeight } = window

    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight
    if (bottomOfWindow) {
      this.clipService.getClips()
    }
  }

}
