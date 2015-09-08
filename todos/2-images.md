images are daunting :)

plan is github pages

options
=======

O1- commit image *as is* and process them in build ?
----------------------------------------------------
looks easy just use https://github.com/sindresorhus/gulp-imagemin

cons:

* heavy commit

O2- commit optimized images
---------------------------

pros:

* reduce build (over)processing
* green commit

go and see
==========

but image are so HUGE!
----------------------

```
~/tmp/photos $ ll *0622*
-rw-r--r-- 1 thenrio 3457390 Jul  8  2012 IMGP0622.JPG
```

see that http://linuxcommando.blogspot.fr/2014/09/how-to-optimize-jpeg-images.html

```
~/tmp/photos $ time jpegtran -copy none -progressive -optimize < IMGP0622.JPG > imgp0622.min.jpg
real    0m1.054s
user    0m1.024s
sys     0m0.028s
```

and then

```
~/tmp/photos $ ll *0622*
-rw-r--r-- 1 thenrio 3457390 Jul  8  2012 IMGP0622.JPG
-rw-r--r-- 1 thenrio 3275453 Sep  8 22:34 imgp0622.min.jpg
```

so fatty 3.5M loses 200k ?
not enough

so definetly go O2

does not see the point in image processing for a static build...

