* Encoding: ISO-8859-1.


GET DATA  /TYPE=TXT
  /FILE="/Users/localmacaccount/Desktop/Summer 2018/G&C Revised/trialdata.csv"
  /ENCODING='Locale'
  /DELCASE=LINE
  /DELIMITERS=",:"
  /ARRANGEMENT=DELIMITED
  /FIRSTCASE=1
  /IMPORTCASE=ALL
  /VARIABLES=
  Worker_ID A14
  Assignment_ID A30
  V3 F3.0
  V4 F13.0
  V5 A14
  Category A17
  V7 A14
  RT A37
  V9 A37
  Task A16
  V11 A12
  Hit A23
  V13 A13
  Testing A38
  V15 A10
  Trial A4
  V17 A10
  Block F2.0
  V19 A13
  Duration F7.0
  V21 A18
  Configuration A9
  V23 A13
  Response A8
  V25 A14
  Condition A14.
CACHE.
EXECUTE.
DATASET NAME DataSet1 WINDOW=FRONT.

DATASET ACTIVATE DataSet1.
* Custom Tables.
CTABLES
  /VLABELS VARIABLES=Worker_ID Condition Task Testing Hit RT DISPLAY=LABEL
  /TABLE Worker_ID > Condition > Task BY Testing [MEAN] + Hit [MEAN] + RT [S][MEDIAN]
  /CATEGORIES VARIABLES=Worker_ID Condition Task ORDER=A KEY=VALUE EMPTY=EXCLUDE.

* Custom Tables.
CTABLES
  /VLABELS VARIABLES=Worker_ID Condition Task Testing Block Hit RT 
    DISPLAY=LABEL
  /TABLE Worker_ID [C] > Condition [C] > Task [C] BY Testing [S][MEAN] > Block + Hit [S][MEAN] + RT 
    [S][MEDIAN]
  /CATEGORIES VARIABLES=Worker_ID Condition Task Block ORDER=A KEY=VALUE EMPTY=EXCLUDE.

DATASET ACTIVATE DataSet3.
* Custom Tables.
CTABLES
  /VLABELS VARIABLES=Condition Task SB1M SB2M SB3M SB4M TM 
    DISPLAY=LABEL
  /TABLE Condition > Task BY SB1M [MEAN] + SB2M [MEAN] + SB3M [MEAN] + SB4M [MEAN] + TM [MEAN, 
    COUNT F40.0]
  /CATEGORIES VARIABLES=Condition Task ORDER=A KEY=VALUE EMPTY=EXCLUDE.


DATASET ACTIVATE DataSet1.
* Chart Builder.
GGRAPH
  /GRAPHDATASET NAME="graphdataset" VARIABLES=Condition MEAN(TM)[name="MEAN_TM"] Task 
    MISSING=LISTWISE REPORTMISSING=NO
  /GRAPHSPEC SOURCE=INLINE.
BEGIN GPL
  SOURCE: s=userSource(id("graphdataset"))
  DATA: Condition=col(source(s), name("Condition"), unit.category())
  DATA: MEAN_TM=col(source(s), name("MEAN_TM"))
  DATA: Task=col(source(s), name("Task"), unit.category())
  COORD: rect(dim(1,2), cluster(3,0))
  GUIDE: axis(dim(3), label("Condition"))
  GUIDE: axis(dim(2), label("Mean TM"))
  GUIDE: legend(aesthetic(aesthetic.color.interior), label("Task"))
  SCALE: linear(dim(2), include(0))
  ELEMENT: interval(position(Task*MEAN_TM*Condition), color.interior(Task), 
    shape.interior(shape.square))
END GPL.
