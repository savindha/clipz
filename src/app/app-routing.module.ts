import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { ClipComponent } from './clip/clip.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { CilpService } from './services/cilp.service'
const routes: Routes = [{
  path: '',
  component: HomeComponent
},
{
  path: 'clip/:id',
  component: ClipComponent,
  resolve: {
    clip: CilpService
  }
},
{
  path: '',
  loadChildren: async () => (await import('./video/video.module')).VideoModule
},
{
  path: '**',
  component: NotFoundComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
