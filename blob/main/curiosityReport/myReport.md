# Curiosity Report
###### Jacob Wise
A deep dive into serverless architechure and where to go from here.

### A note:
I only got part of the way through the Deep Research report from Chat, but it was a gold mine for nifty tricks and a really good read. This report is sourced largely from the insights gained from that, and the questions I asked because of it.
Throughout the report I will mark (**in bold**) questions I have arrived at as expansion points for expanding this report or to do further investigating. The quest for knowlege never ends! 

## Overview and Our Heading
The crux the serverless architecture is granularity and scalability. Thankfully for us, these two ideals go hand in hand and have a load of other perks. Among these are:
- decreased cost (because the cost of server-related compute is more effectivley spent - reduced downtime bc you pay for what you use).
- stronger separation of concerns - including better decoupling of code, security key management, and ease in making things run faster.
- increased expanability and scalability (to places we havent been to before and at scales never before reached)

In addition to this, the serverless architechure strengthens our focus on concerns we would otherwise juggle amixt others. In the serverless architechture, these become more relevant, more avaiable to fix and hence, more addressable:
- code efficiency (Speed and resouce use)
- documentation (human language or as iac (infrastructure-as-code) code)
- security separation

This paradign boils down into 3 core ideals:
- the code should be packaged and run in as appropriately small segments as necessary. If normal and single server code bases are like a sandbox full of rocks, our goal with serverless is to get the sand as fine-grained as possible. Even to the point that moving things around becomes like dealing with water.
- reduce code duplication by parameterizing everything.
- everything should be code but not everything should be in the code (iac should be config, but separated from the rest becuase of the ideal of separation of concerns).

It is my personal opinion that Serverless architechure represents the peak of good programming practice.

## Main Notes on my Reading

The reading brought me to a discussion of Server-Side Rendering. It mentioned AWS Edge as a way to allow for server side rendering while still adhering to the design ideas of serverless architecture.

**What is aws edge?**
**Are there any perks to using server side rendering? Are there irredeemable fatal flaws?**

Research uncovered how one might expand the CI pipeline to configure the resources we configured manually in aws (a predictable extension, but not a level we reached by the end) to the point of configuring everything. Dev environements should be easy to push to, while prod environements should be steeped in a distinct process.
This idea of easy to deploy small changes can be mirrored with how to do testing. In  my capstone class we worked on different branches in a more typical way - with all of our student work coming into a byu dev branch. Using workflows to work on finer granularity of pushes would be a great way to implement this (in my opinion).

They made a good point about compartmentalizing the workflow - one job for testing, linting, deploying each. Apparently you can also make generic workflows that you can call from other workflows, this could make parallel workflows for deploying to prod/dev easier/more consistent. For multi-client scenarios, there are even ways to deploy multiple sets of environment pipelines at once (termed “matrix strategies”). I also didn't realize that you can run AWS lambda architure locally via AWS SAM CLI, so too with caching node dependancies.

For security concerns using short lived access tokens OIDC (**I haven't done much with that**) can replace much of hard coded environment variables to limit the danger of exposure.

**What is aws codedeploy?**

They talked about having each microservice have its own repo? Or, rather one context = one service = one repo. They focused on good programming principles of not dupliating ode - using an internal library/package with all shared dependencies as a good idea. They also mentioned a good practice which we employed in cs340 more - of keeping business logic separate from server implementation code (specifics about how to upload to dyanmo etc.).

The Deep Research came up with a lot of statements that phrased well what I would like to tell an AI when building code repos. For instance - 

> Keep your business logic separate from cloud-specific code. For instance, write your core logic as pure functions or classes (which you could potentially run locally for tests), and have thin adapters in your Lambda handlers that invoke this logic. This “hexagonal” or clean architecture approach makes it easier to test and even switch the underlying platform if needed. You could theoretically run the same logic in an Express server or a CLI tool, for example, without changes, if the cloud-specific parts are isolated.

This thought was a good razor for knowing if code is being structured properly - If you’re going all in on cloud compute, the more libraries you have, the more likely it is that you’re not doing something right. > The AWS Compute Blog notes that using AWS’s native features (like API Gateway’s request validation, auth, and routing) often eliminates the need for additional code and libraries in your Lambdas, leading to simpler deployments and less to maintain​

**What is SAM (Serverless application model?)**
The goal is to get everything into code so you can regulate it and document it. But keep the config out of your code - separation of concerns :)

Lambda cost considerations:
- write code to be as efficient as possible
- reuse database connections across invocations if your runtime allows
- avoid "cold-start" heavy dependencies 
**To look into more: AWS SAM or Serverless Framework as offline infrastructure testing**


See also the orignal Deep Research Report that I found. It was awesome! (Its in the same folder in the repo).
