import { AuthGuard } from './gaurds/auth.gaurd';
import { IntroGuard } from './gaurds/intro.guard';
import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule),
  },
  {
    path: 'intro',
    loadChildren: () => import('./pages/intro/intro.module').then( m => m.IntroPageModule),
    canLoad: [AuthGuard],
  },
  {
    path: '',
    loadChildren: () => import ('./tabs/tabs.module').then(m => m.TabsPageModule),
    canLoad: [AuthGuard, IntroGuard],
  },
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
