# GoldStone and Carvalho Online Replication Experiment

The aim of this project was to replicate the findings of GoldStone and Carvalho's 2015 experiment which highlighted the benefits of interleaved and blocked study. Through python's Psiturk package I was able to post online experiments to Amazon Turk workers and automate features like counterbalancing, bonusing workers for impressive results, preventing workers from completing the same experiment more than once, and others.

# To Download Psiturk

and be able to run this experiment locally, install python onto your computer and type this command on the terminal:

```
pip install psiturk
```

Afterwards, clone this experiment onto your desktop and type on the terminal: 

```
cd Desktop/G&C_OriginalStim
psiturk
server on
debug
```
to run this experiment locally on your default browser! For more information on Psiturk click [here](https://psiturk.readthedocs.io/en/latest/) to visit Psiturk's documentation page.

# File Summary
Both experiments are essentially the same, with the exception that G&C_OriginalStim tests subjects using G&C original stimuli (found under static/images/) while G&C_Revised uses stimuli drawn with D3.js under static/js/task.js. 

## Static
Under static you'll find a css style sheet, fonts, images, libraries used, and task.js, which is where all of the code can be found for this experiment.

## Templates
Under templates are all the html webpages used in the experiment, including the instructions for both the assesment phase and study phases, the ad dispalyed on Amazon Turk, the main webpage in which the stimuli is presented, the questionnaire webpage, and others.

## Data
Summaries of accuracy in tests and study phases as well as bar graphs comparing the two can be found as well in each respective folder.

## My Contribution
Since I was the only one that worked on this code, everything was done locally on a computer in the lab and therefore the commit history consists of me uploading all the code in one go and deleting files that were unimportant. I wrote the code in the task.js folder, the layout in all the html pages, and the css style sheets, changing what was necessary from the template stroop experiment provided by Psiturk.

