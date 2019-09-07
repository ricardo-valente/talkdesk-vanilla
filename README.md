# BY Starter V2
2017/09 - Front-end boilerplate for faster and easier web development. Without some noisy plugins. \
JavaScript + CSS3 + HTML 5.

## Installation
```
git clone http://gitlab.bycom.pt/gitlab/bystarter-v2.git
rm -rf !$/.git

npm install && bower install

gulp
gulp config
gulp serve
```

## Project
_If blank, please fill in the necessary info._
* Name:
* Description: 
* Start Date:
* Finish Date:
- Dev URL:
- Staging URL:
- Production URL:

## Git Flow
ENV Branching is based on the environments the application deploys to:
 - **production**: the live site
 - **stage**: for staging features to the client
 - **development**: for staging features internally
 
Each environment has a dedicated ENV branch: **master**, **stage** and **dev**. At any given time, those branches will resemble exactly what’s on their corresponding environment. 

All commits are done on a feature branch and merged into the environment you wish to deploy. With continuous integration, you can automatically push the new changes to **development** environment. To do this just type on your console: 
```
gulp deploy
> this will upload your build to html folder
> http://[client].dev.byclients.com/html/index.html
 
gulp deploy:live
> this will upload all of your assets to the matching folders on dev server).
> If everything is OK you still need to manually update stage and production environment.
```

##### Rules:

To maintain the integrity of the branches and ensure we can deploy features independently we follow these rules:
1. **NEVER** commit directly to an ENV branch (master, stage or dev);
2. **NEVER** merge one ENV branch into another;
3. **ALLWAYS** create a feature or fix branch to your development;
4. **Feature** branches should be autonomously deployable.
 
A Simple Example

![Git flow example](http://clientes.bycom.pt/gitflow/branching.jpg)



## Gulp tasks
```
gulp config
> Project configuration start (name, description, assets prefix, dev url)

gulp serve 
> Localhost start - please update index.html with every new template file

gulp deploy 
> This task will upload all you DIST files to DEV SERVER, to a HTML folder for templating testing. 
> URL: http://[client].dev.byclients.com/html/index.html

gulp deploy:live 
> This task will upload all you DIST files to DEV SERVER. It will upload to each asset folder on the server, this requires that the server is ready for this files: assets-head.cshtml, assets-foot.cshtml. 
> URL**: http://[client].dev.byclients.com
> This will overwrite the old assets files. 
```


##### Other tasks
```
gulp dist 
gulp dist:deploy
gulp sass 
gulp sass:deploy
gulp scripts 
gulp scripts:deploy 
```

## Access URLs e.g.
```
 #--------------------------------------#
       Local: http://localhost:3000
    External: http://192.168.4.212:3000
          UI: http://localhost:3001
 #--------------------------------------#
 UI External: http://192.168.4.212:3001
 #--------------------------------------#
 ```

## Extra Info
###### Components
* Normalize 2.1.0
* BY Grid 1.1.0 (based on v3.1.1 of Twitter's Bootstrap)
* Modernizr 2.6.2
* jQuery 3.1.1
* js-cookie 2.1.4

###### Workflow + Tools
* Bower 1.7.2
* Gulp 3.9.1 
* Browser Sync

###### Browser Support
* Mozilla Firefox 5+
* Google Chrome 14+
* Safari 5+
* Opera 11+
* Internet Explorer 10+

###### Authors and Contributors
* Mário Silva (@mario.silva)
* Rui Rosa (@rui.rosa) 

###### Versioning
* This project uses MAJOR.MINOR.PATCH [Semantic Versioning](http://semver.org/).
