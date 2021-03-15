# threejsCube
安装ts

```bash
npm install -g typescript
```

安装依赖

```bash
npm install
```

运行

```bash
npm run dev
```

访问
 [http://127.0.0.1:3000/](http://127.0.0.1:3000/)


bug: 
2021/2/20
 todo:旋转后，获取面的数据不对。
   分析：position在旋转后，还是未旋转的position,需要经过一个变换（大概是将局部位置转世界位置的那种）
   fix:参考https://stackoverflow.com/questions/15098479/how-to-get-the-global-world-position-of-a-child-object 相关API:getWorldPosition

 todo:旋转右面，再旋转前面，前面获取的方块不对。
   分析：获取面的方块是通过position位置计算获取的，原因还是position的问题，需要使用世界坐标而非局部坐标
   fix:改为使用世界坐标
 
 todo:旋转右面，再旋转前面，有2块的最终位置不对。
   分析：这两块在最初是属于右面的，应该是在计算旋转的地方不对，在具体点描述问题：两块已经过旋转的方块，要基于新旋转中心方块做旋转，出问题了。
   fix:基于中心方块旋转实现有问题，应该要使用世界空间的位置来计算偏移值，再将周边放到中心位置
  
 todo：现在周边方块旋转后，最终位置是对的，但是旋转出来的面不对（方块旋转的感觉怪怪的，同样的速度，感觉比之前快了）。
   分析:基于中心旋转估计还有问题,位置应该还是不对，只是整体看起来是一个魔方而已
   fix:旋转过程中不断的获取相对位置，这样是不对的，魔方每个面周围的与中间的那块相对位置都是不变的，所以只需要在旋转前获取一次就够了。
  
 todo:MAGICCUBE_ROTATE_SPEED导致旋转位置不对，速度为什么会影响位置。
   分析：不知道什么情况，以前有出现过，这个速度控制写法感觉不太对劲
   fix: 旋转速度的实现还需要从更新帧率上入手，重写了速度相关的代码。
 
 todo:动画旋转过程中，让其再旋转，会导致旋转位移出错
   分析：每次按键旋转，会记录相对位置。旋转是根据相对位置再位移的。旋转过程中不该获取相对位置。
   fix:带动画的旋转，在旋转过程中，不能旋转，也不要记录相对位置。

 todo:现在周边旋转在慢速下，第二次旋转，位移是对的，但是面的朝向不对。
   分析：是在已有旋转的基础上，再旋转出现的问题。感觉还是旋转的问题，看在只显示右侧的一块可以看出，第二次旋转位置是不对的
   fix:旋转第二次后，不管是中间还是周边，都是带有同样的旋转的。计算相对位置的时候，没有考虑到在旋转矩阵的情况。右侧旋转一次和旋转第二次，其实相对位置是不变的，因为都在旋转就相当于都没有旋转。
   fix:之前那种记录第一次就不记录基于世界坐标的相对位置的办法不可取。应该是每次计算相对位置时，要基于中间方块的坐标系。办法有2。
   方法1：将周边方块的位置转换成基于中间坐标系后，再相减，中间方块在自己的坐标系下，位置为原点，所以相减的结果应该是周边方块的位置。
   方法2：在世界坐标系下，周边方块位置减去中间方块的位置，偏移结果再转换成基于中间方块坐标系。（代码采用这种）

 todo:先转右侧一次，再转左侧一次，位置，朝向都不对。
   分析：解决连续转同侧时，只计算了一次相对位置之后都不计算，因为同侧所有方块的旋转矩阵都是一致的，区别只在位置。
   如果多个方块旋转矩阵不一致时，要算出正确的相对位置，而且不能再用中间方块的旋转矩阵，就连中间方块，也应该基于其所在面的初始矩阵，旋转再平移0个位置这样的方式进行。四周的方块基于其所在面的初始矩阵，旋转再平移（相对位置数）个位置。
   还有一个思路：基于中间方块的局部坐标系，计算四周的方块相对于中间方块的偏移。然后就可以按照目前的方式旋转，平移。

