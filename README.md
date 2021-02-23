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

 todo:旋转右面，再旋转前面，前面获取的方块不对
   分析：获取面的方块是通过position位置计算获取的，原因还是position的问题，需要使用世界坐标而非局部坐标
   fix:改为使用世界坐标
 
 todo:旋转右面，再旋转前面，有2块的最终位置不对
   分析：这两块在最初是属于右面的，应该是在计算旋转的地方不对，在具体点描述问题：两块已经过旋转的方块，要基于新旋转中心方块做旋转，出问题了。
   fix:基于中心方块旋转实现有问题，应该要使用世界空间的位置来计算偏移值，再将周边放到中心位置
  
 todo：现在周边方块旋转后，位置是对的，但是旋转出来的面不对（方块旋转的感觉怪怪的，同样的速度，感觉比之前快了）
  分析:基于中心旋转估计还有问题
  
 todo:MAGICCUBE_ROTATE_SPEED导致旋转位置不对，速度为什么会影响位置
  分析：不知道什么情况，以前有出现过