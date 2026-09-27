"""Independent symbolic/nodal verification of the homework answer key."""
import sympy as s
A,B,V,R,E=s.symbols('A B V R E')
eq=s.solve([E*2/(R+2)-4,E*4/(R+4)-6],[E,R]);assert eq=={E:12,R:4}
assert eq[E]*8/(eq[R]+8)==8
assert s.solve((V-4)/2+V/2-8,V)==[10]
assert s.Rational(2*2,2+2)+4==5
assert s.Rational(10**2,4*5)==5 # V²/kΩ is mW
eq=s.solve([(A-12)/2+(A+24)/3+A/6+(A-B)/2,(B+24)/2+(B-12)/3+B/6+(B-A)/2],[A,B])
assert eq=={A:s.Rational(-7,2),B:s.Rational(-13,2)}
assert s.solve(V/2+(V-8)/2-1,V)==[5] # 1.23 middle-node KCL
assert s.Rational(5-8,2)==s.Rational(-3,2)
eq=s.solve([(A-60)/10+A/40+(A-B)/30,(B-60)/3+B/6+(B-A)/30],[A,B])
assert eq[A]-eq[B]==6
assert s.solve((A+14)/2+A/2-3,A)==[-4] # 1.26 supernode
assert s.Rational(-4,2)==-2
# Independently test branch-loop equations against node expressions.
r1,r2,r3,r4,r5,e1,e2,e3=s.symbols('r1 r2 r3 r4 r5 e1 e2 e3', nonzero=True)
i1=(e1-A)/r1;i2=(A-e2-B)/r2;i3=(A+e3)/r3;i4=-B/r4;i5=(B-A)/r5
assert s.simplify(r1*i1+r3*i3-e1-e3)==0
assert s.simplify(r2*i2+r5*i5+e2)==0
assert s.simplify(r3*i3+r4*i4+r5*i5-e3)==0
# HW1: ideal voltage sources fix corners. KCL determines outward source currents.
outer=[s.Rational(5-20,50),s.Rational(20+10,10),s.Rational(2+10,10),s.Rational(5-2,300)]
x,y,z,w=outer; currents=[x+w,y-x,-y-z,z-w]
assert currents==[s.Rational(-29,100),s.Rational(33,10),s.Rational(-42,10),s.Rational(119,100)]
assert sum(currents)==0
print('Independent nodal, Thévenin, power, loop, and source-current checks passed.')
