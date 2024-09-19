## Intsall need software 

  apt install parted tmux vim lvm2 -y
  
## check status 
```
  lsblk
```

## Adding Storage
 ```
  parted /dev/sdx
    mklabel gpt
    mkpart primary ext4 0% 100%
    set 1 lvm on
    quit
  pvcreate /dev/sdx1
  ```
  
 
##  Create a volume group  
```
  pvdisplay
  lvs
```

```  
  vgcreate vg-data /dev/sda1 /dev/sdb1 .../dev/sdx1
  lvcreate -n lv-data -l 100%FREE vg-data
  mkfs.ext4 /dev/vg-data/lv-data
  mkdir /dev/vg-data/lv-data /data
```

```  
  vim /etc/fstab
  /dev/vg-data/lv-data   /data   ext4   defaults   0 0
```

```
  pvdisplay
  lvs
  
  reboot
```
  
##  Extend a volume group  

```  
  vgextend vg-data /dev/sdx1
  lvresize --extents +100%FREE --resizefs vg-data/lv-data
```

``` 
  pvdisplay
  lvs
```
